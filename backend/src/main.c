#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "file_io.h"
#include "goods.h"
#include "utils.h"
#include "inventory.h"

#define DB_FILE_NAME "goodsinfo.db"
#define LEGACY_TEXT_FILE_NAME "goodsinfo.data"

void show_menu_of_start()
{
    printf("\n=========== supermarket manage system ===========\n");
    printf("1. add goods\n");
    printf("2. search goods (name / id)\n");
    printf("3. view goods (with sort options)\n");
    printf("4. modify goods\n");
    printf("5. delete goods\n");
    printf("6. inventory analysis\n");
    printf("7. exit\n");
    printf("=================================================\n");
    printf("please input your choice: ");
}

void show_sort_menu()
{
    printf("\nchoose sort field:\n");
    printf("1. id\n");
    printf("2. profit\n");
    printf("3. import time\n");
    printf("input: ");
}

void show_search_menu()
{
    printf("\nchoose search type:\n");
    printf("1. name search (kmp substring search)\n");
    printf("2. id search (exact match)\n");
    printf("3. time range search (import time)\n");
    printf("input: ");
}

static int parse_date_to_timestamp(const char* date_text,int end_of_day,long* out_ts)
{
    if(date_text == NULL || out_ts == NULL){
        return 0;
    }

    int year = 0;
    int month = 0;
    int day = 0;

    if(sscanf(date_text,"%d/%d/%d",&year,&month,&day) != 3){
        return 0;
    }

    if(year < 1970 || month < 1 || month > 12 || day < 1 || day > 31){
        return 0;
    }

    struct tm tm_value;
    memset(&tm_value,0,sizeof(tm_value));
    tm_value.tm_year = year - 1900;
    tm_value.tm_mon = month - 1;
    tm_value.tm_mday = day;
    tm_value.tm_hour = end_of_day ? 23 : 0;
    tm_value.tm_min = end_of_day ? 59 : 0;
    tm_value.tm_sec = end_of_day ? 59 : 0;
    tm_value.tm_isdst = -1;

    time_t t = mktime(&tm_value);
    if(t == (time_t)-1){
        return 0;
    }

    *out_ts = (long)t;
    return 1;
}

static int days_from_civil(int year,int month,int day)
{
    year -= (month <= 2);
    const int era = (year >= 0 ? year : year - 399) / 400;
    const unsigned yoe = (unsigned)(year - era * 400);
    const unsigned doy = (153 * (month + (month > 2 ? -3 : 9)) + 2) / 5 + (unsigned)day - 1;
    const unsigned doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    return era * 146097 + (int)doe - 719468;
}

static void civil_from_days(int z,int* year,int* month,int* day)
{
    z += 719468;
    const int era = (z >= 0 ? z : z - 146096) / 146097;
    const unsigned doe = (unsigned)(z - era * 146097);
    const unsigned yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    int y = (int)yoe + era * 400;
    const unsigned doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    const unsigned mp = (5 * doy + 2) / 153;
    unsigned d = doy - (153 * mp + 2) / 5 + 1;
    unsigned m = mp + (mp < 10 ? 3 : -9);
    y += (m <= 2);

    *year = y;
    *month = (int)m;
    *day = (int)d;
}

static int compare_int_value(const void* left,const void* right)
{
    int a = *(const int*)left;
    int b = *(const int*)right;
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
}

void wait_for_continue()
{
    printf("\npress Enter to continue...");
    getchar();
#ifdef _WIN32
    system("cls");
#else
    system("clear");
#endif
}

void recalculate_goods_fields(Goods* goods)
{
    if(goods == NULL){
        return;
    }

    goods->discounted_sell_price = goods->original_sell_price * goods->discount;
    goods->profit = (goods->discounted_sell_price - goods->purchase_price) * (float)goods->quantity;
}

int input_goods_editable_fields(Goods* goods)
{
    if(goods == NULL){
        return 0;
    }

    printf("input goods name (or q to cancel): ");
    if(!input_optional_string(goods->name,sizeof(goods->name))){
        return 0;
    }

    printf("input purchase price (or q to cancel): ");
    if(!input_optional_float(&goods->purchase_price)){
        return 0;
    }

    printf("input original sell price (or q to cancel): ");
    if(!input_optional_float(&goods->original_sell_price)){
        return 0;
    }

    printf("input discount (0~1, e.g. 0.8, or q to cancel): ");
    if(!input_optional_float(&goods->discount)){
        return 0;
    }

    printf("input quantity (or q to cancel): ");
    if(!input_optional_int(&goods->quantity)){
        return 0;
    }

    recalculate_goods_fields(goods);
    return 1;
}

int save_db_after_change(LinkList head)
{
    int result = Save_Goods_To_DB(head,DB_FILE_NAME);
    if(result != 1){
        printf("warning: failed to save data into %s\n",DB_FILE_NAME);
        return -1;
    }
    return 0;
}

void handle_add_goods(LinkList head)
{
    Goods new_goods;
    memset(&new_goods,0,sizeof(Goods));

    if(head != NULL && head->next != NULL){
        printf("\ncurrent goods list:\n");
        print_goods_list(head);
    }

    printf("\ninput goods id (or q to cancel): ");
    if(!input_optional_string(new_goods.id,sizeof(new_goods.id))){
        printf("add goods cancelled\n");
        return;
    }

    if(find_goods_by_id(head,new_goods.id) != NULL){
        printf("id already exists, add failed\n");
        return;
    }

    if(!input_goods_editable_fields(&new_goods)){
        printf("add goods cancelled\n");
        return;
    }
    new_goods.import_time = (long)time(NULL);

    if(add_goods(head,new_goods) == 0){
        printf("goods added successfully\n");
        save_db_after_change(head);
    }else{
        printf("goods add failed\n");
    }
}

void handle_delete_goods(LinkList head)
{
    if(head == NULL || head->next == NULL){
        printf("goods list is empty\n");
        return;
    }

    printf("\ncurrent goods list:\n");
    print_goods_list(head);

    char id[50];
    printf("\ninput goods id to delete (or q to cancel): ");
    if(!input_optional_string(id,sizeof(id))){
        printf("delete cancelled\n");
        return;
    }

    if(delete_goods(head,id) == 0){
        printf("goods deleted successfully\n");
        save_db_after_change(head);
        printf("\nupdated goods list:\n");
        print_goods_list(head);
    }else{
        printf("delete failed\n");
    }
}

void handle_search_by_name(LinkList head)
{
    if(head == NULL || head->next == NULL){
        printf("goods list is empty\n");
        return;
    }

    char keyword[50];
    printf("\ninput name keyword for kmp search (or q to cancel): ");
    if(!input_optional_string(keyword,sizeof(keyword))){
        printf("search cancelled\n");
        return;
    }

    Node* currentNode = head->next;
    int index = 0;
    int matched = 0;

    print_goods_header();
    while(currentNode != NULL){
        index++;
        if(kmp_match(currentNode->data.name,keyword)){
            matched++;
            print_one_goods(&currentNode->data,matched);
        }
        currentNode = currentNode->next;
    }
    printf("--------------------------------------------------------------------------------------------------------------------------------\n");

    if(matched == 0){
        printf("not found\n");
    }else{
        printf("matched goods count: %d\n",matched);
    }
}

void handle_search_by_id(LinkList head)
{
    if(head == NULL || head->next == NULL){
        printf("goods list is empty\n");
        return;
    }

    char id[50];
    printf("\ninput id to search (or q to cancel): ");
    if(!input_optional_string(id,sizeof(id))){
        printf("search cancelled\n");
        return;
    }

    Node* target = find_goods_by_id(head,id);
    if(target == NULL){
        printf("cannot find goods with id: %s\n",id);
        return;
    }

    print_goods_header();
    print_one_goods(&target->data,1);
    printf("--------------------------------------------------------------------------------------------------------------------------------\n");
}

void handle_search_by_time_range(LinkList head)
{
    if(head == NULL || head->next == NULL){
        printf("goods list is empty\n");
        return;
    }

    int goods_count = get_goods_count(head);
    int* day_values = (int*)malloc((size_t)goods_count * sizeof(int));
    if(day_values == NULL){
        printf("memory allocation failed\n");
        return;
    }

    int filled = 0;
    Node* scanNode = head->next;
    while(scanNode != NULL){
        time_t t = (time_t)scanNode->data.import_time;
        struct tm* tm_ptr = localtime(&t);
        if(tm_ptr != NULL){
            day_values[filled++] = days_from_civil(
                tm_ptr->tm_year + 1900,
                tm_ptr->tm_mon + 1,
                tm_ptr->tm_mday
            );
        }
        scanNode = scanNode->next;
    }

    if(filled == 0){
        free(day_values);
        printf("no valid import dates found\n");
        return;
    }

    qsort(day_values,(size_t)filled,sizeof(int),compare_int_value);

    int unique_count = 0;
    for(int i = 0;i < filled;i++){
        if(unique_count == 0 || day_values[i] != day_values[unique_count - 1]){
            day_values[unique_count++] = day_values[i];
        }
    }

    printf("\navailable date ranges with goods:\n");
    int segment_index = 1;
    int segment_start = day_values[0];
    int segment_end = day_values[0];

    for(int i = 1;i < unique_count;i++){
        if(day_values[i] == segment_end + 1){
            segment_end = day_values[i];
            continue;
        }

        int sy = 0,sm = 0,sd = 0,ey = 0,em = 0,ed = 0;
        civil_from_days(segment_start,&sy,&sm,&sd);
        civil_from_days(segment_end,&ey,&em,&ed);
        printf("%d. %d/%d/%d-%d/%d/%d\n",segment_index++,sy,sm,sd,ey,em,ed);

        segment_start = day_values[i];
        segment_end = day_values[i];
    }

    int sy = 0,sm = 0,sd = 0,ey = 0,em = 0,ed = 0;
    civil_from_days(segment_start,&sy,&sm,&sd);
    civil_from_days(segment_end,&ey,&em,&ed);
    printf("%d. %d/%d/%d-%d/%d/%d\n",segment_index,sy,sm,sd,ey,em,ed);

    free(day_values);

    char start_text[50];
    char end_text[50];
    long start_ts = 0;
    long end_ts = 0;

    while(1){
        printf("\ninput start date (YYYY/M/D, or q to cancel): ");
        if(!input_optional_string(start_text,sizeof(start_text))){
            printf("search cancelled\n");
            return;
        }

        if(!parse_date_to_timestamp(start_text,0,&start_ts)){
            printf("invalid start date format, please retry\n");
            continue;
        }
        break;
    }

    while(1){
        printf("input end date (YYYY/M/D, or q to cancel): ");
        if(!input_optional_string(end_text,sizeof(end_text))){
            printf("search cancelled\n");
            return;
        }

        if(!parse_date_to_timestamp(end_text,1,&end_ts)){
            printf("invalid end date format, please retry\n");
            continue;
        }
        break;
    }

    if(start_ts > end_ts){
        printf("invalid range: start date is later than end date\n");
        return;
    }

    Node* currentNode = head->next;
    int matched = 0;
    print_goods_header();

    while(currentNode != NULL){
        long t = currentNode->data.import_time;
        if(t >= start_ts && t <= end_ts){
            matched++;
            print_one_goods(&currentNode->data,matched);
        }
        currentNode = currentNode->next;
    }

    printf("--------------------------------------------------------------------------------------------------------------------------------\n");
    printf("%s-%s has %d goods\n",start_text,end_text,matched);
}

void handle_search_goods(LinkList head)
{
    show_search_menu();
    int search_choice = 0;
    if(!input_optional_int(&search_choice)){
        printf("search cancelled\n");
        return;
    }

    if(search_choice == 1){
        handle_search_by_name(head);
    }else if(search_choice == 2){
        handle_search_by_id(head);
    }else if(search_choice == 3){
        handle_search_by_time_range(head);
    }else{
        printf("invalid search choice\n");
    }
}

void handle_view_goods(LinkList head)
{
    if(head == NULL || head->next == NULL){
        printf("goods list is empty\n");
        return;
    }

    show_sort_menu();
    int field_choice = 0;
    if(!input_optional_int(&field_choice)){
        printf("view cancelled\n");
        return;
    }

    printf("choose order: 1. ascending  2. descending\ninput: ");
    int order_choice = 0;
    if(!input_optional_int(&order_choice)){
        printf("view cancelled\n");
        return;
    }

    howtosort order;
    if(order_choice == 1){
        order = ASENDING;
    }else if(order_choice == 2){
        order = DESCENDING;
    }else{
        printf("invalid order choice\n");
        return;
    }

    sortbywhat type;
    if(field_choice == 1){
        type = ID;
    }else if(field_choice == 2){
        type = PROFIT;
    }else if(field_choice == 3){
        type = IMPORT_TIME;
    }else{
        printf("invalid sort field choice\n");
        return;
    }

    sort_goods_by_type(head,type,order);
    print_goods_list(head);
}

void handle_modify_goods(LinkList head)
{
    if(head == NULL || head->next == NULL){
        printf("goods list is empty\n");
        return;
    }

    printf("\ncurrent goods list:\n");
    print_goods_list(head);

    char id[50];
    printf("\ninput goods id to modify (or q to cancel): ");
    if(!input_optional_string(id,sizeof(id))){
        printf("modify cancelled\n");
        return;
    }

    Node* target = find_goods_by_id(head,id);
    if(target == NULL){
        printf("cannot find goods with id: %s\n",id);
        return;
    }

    printf("current goods info:\n");
    print_goods_header();
    print_one_goods(&target->data,1);
    printf("--------------------------------------------------------------------------------------------------------------------------------\n");

    Goods updated = target->data;

    if(!input_goods_editable_fields(&updated)){
        printf("modify cancelled\n");
        return;
    }
    strcpy(updated.id,target->data.id);
    updated.import_time = target->data.import_time;

    if(update_goods(head,id,updated) == 0){
        printf("goods updated successfully\n");
        save_db_after_change(head);
        printf("\nupdated goods list:\n");
        print_goods_list(head);
    }else{
        printf("goods update failed\n");
    }
}

void to_diff_department(int choice, LinkList head)
{
    switch(choice){
        case 1:
            handle_add_goods(head);
            break;
        case 2:
            handle_search_goods(head);
            break;
        case 3:
            handle_view_goods(head);
            break;
        case 4:
            handle_modify_goods(head);
            break;
        case 5:
            handle_delete_goods(head);
            break;
        case 6:
            handle_inventory(head);
            break;
        case 7:
            printf("thank you for using the program, see you next time\n");
            break;
        default:
            printf("wrong input, please try again\n");
            break;
    }
}

int main()
{
    Node* head = init_head_node();
    if(head == NULL){
        return -1;
    }

    int db_load_result = Load_Goods_From_DB(head,DB_FILE_NAME);
    if(db_load_result == 1){
        printf("db load success: %s\n",DB_FILE_NAME);
    }else if(db_load_result == 0){
        int text_load_result = Load_Goods_From_File(head,LEGACY_TEXT_FILE_NAME);
        if(text_load_result == 1){
            printf("legacy text load success: %s\n",LEGACY_TEXT_FILE_NAME);
            Save_Goods_To_DB(head,DB_FILE_NAME);
            printf("legacy data migrated into %s\n",DB_FILE_NAME);
        }else{
            printf("no existing db found, start with empty goods list\n");
        }
    }else{
        printf("warning: db load failed, start with current memory state\n");
    }

    int choice = 0;
    while(1){
        show_menu_of_start();
        choice = input_valid_int();

        to_diff_department(choice,head);

        if(choice == 7){
            break;
        }

        wait_for_continue();
    }

    Save_Goods_To_DB(head,DB_FILE_NAME);
    free_whole_list(head);
    return 0;
}
