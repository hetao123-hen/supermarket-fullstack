#include "goods.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <ctype.h>

int add_goods(LinkList head,Goods new_goods)
{
    if(head == NULL){
        return -1;
    }

    Node* newNode = (Node*)malloc(sizeof(Node));
    if(newNode == NULL){
        perror("failed to allocate memory");
        return -1;
    }

    newNode->data = new_goods;
    newNode->next = head->next;
    head->next = newNode;
    return 0;
}

int delete_goods(LinkList head,const char* id)
{
    if(head == NULL || id == NULL){
        return -1;
    }

    Node* currentNode = head;
    while(currentNode->next != NULL){
        if(strcmp(currentNode->next->data.id , id) == 0)
        {
            Node* temp = currentNode->next;
            currentNode->next = temp->next;
            free(temp);
            return 0;
        }
        currentNode = currentNode->next;
    }

    printf("cannot find goods with id: %s\n",id);
    return -1;
}

int update_goods(LinkList head,const char* id,Goods updated_goods)
{
    Node* target = find_goods_by_id(head,id);
    if(target == NULL){
        printf("cannot find goods with id: %s\n",id);
        return -1;
    }

    target->data = updated_goods;
    return 0;
}

Node* find_goods_by_id(LinkList head,const char* id)
{
    if(head == NULL || id == NULL){
        return NULL;
    }

    Node* currentNode = head->next;
    while(currentNode != NULL){
        if(strcmp(currentNode->data.id,id) == 0){
            return currentNode;
        }
        currentNode = currentNode->next;
    }
    return NULL;
}

int find_goods_index_by_id(LinkList head,const char* id)
{
    if(head == NULL || id == NULL){
        return -1;
    }

    Node* currentNode = head->next;
    int index = 0;
    while(currentNode != NULL){
        if(strcmp(currentNode->data.id,id) == 0){
            return index;
        }
        currentNode = currentNode->next;
        index++;
    }
    return -1;
}

static void build_lps_table(const char* pattern,int* lps,int length)
{
    int prefix_len = 0;
    int i = 1;

    lps[0] = 0;

    while(i < length){
        if(tolower((unsigned char)pattern[i]) == tolower((unsigned char)pattern[prefix_len])){
            prefix_len++;
            lps[i] = prefix_len;
            i++;
        }else{
            if(prefix_len != 0){
                prefix_len = lps[prefix_len - 1];
            }else{
                lps[i] = 0;
                i++;
            }
        }
    }
}

int kmp_match(const char* text,const char* pattern)
{
    if(text == NULL || pattern == NULL){
        return 0;
    }

    int text_len = (int)strlen(text);
    int pattern_len = (int)strlen(pattern);

    if(pattern_len == 0){
        return 1;
    }

    int* lps = (int*)malloc(sizeof(int) * pattern_len);
    if(lps == NULL){
        return strstr(text,pattern) != NULL;
    }

    build_lps_table(pattern,lps,pattern_len);

    int i = 0;
    int j = 0;
    while(i < text_len){
        if(tolower((unsigned char)text[i]) == tolower((unsigned char)pattern[j])){
            i++;
            j++;
            if(j == pattern_len){
                free(lps);
                return 1;
            }
        }else{
            if(j != 0){
                j = lps[j - 1];
            }else{
                i++;
            }
        }
    }

    free(lps);
    return 0;
}

static void format_import_time(long raw_time,char* buffer,size_t buffer_size)
{
    if(buffer == NULL || buffer_size == 0){
        return;
    }

    if(raw_time <= 0){
        snprintf(buffer,buffer_size,"N/A");
        return;
    }

    time_t time_value = (time_t)raw_time;
    struct tm* time_info = localtime(&time_value);
    if(time_info == NULL){
        snprintf(buffer,buffer_size,"N/A");
        return;
    }

    strftime(buffer,buffer_size,"%Y-%m-%d %H:%M:%S",time_info);
}

void print_goods_header()
{
    printf("--------------------------------------------------------------------------------------------------------------------------------\n");
    printf("%-4s %-18s %-12s %-10s %-10s %-10s %-10s %-10s %-8s %-20s\n",
           "No.","Name","ID","Buy","Sell","Discount","Final","Profit","Qty","Import Time");
    printf("--------------------------------------------------------------------------------------------------------------------------------\n");
}

void print_one_goods(const Goods* goods,int index)
{
    if(goods == NULL){
        return;
    }

    char time_buffer[32];
    format_import_time(goods->import_time,time_buffer,sizeof(time_buffer));

    printf("%-4d %-18s %-12s %-10.2f %-10.2f %-10.2f %-10.2f %-10.2f %-8d %-20s\n",
           index,
           goods->name,
           goods->id,
           goods->purchase_price,
           goods->original_sell_price,
           goods->discount,
           goods->discounted_sell_price,
           goods->profit,
           goods->quantity,
           time_buffer);
}

int print_goods_list(LinkList head)
{
    if(head == NULL || head->next == NULL){
        printf("goods list is empty\n");
        return 0;
    }

    int count = 0;
    Node* currentNode = head->next;

    print_goods_header();
    while(currentNode != NULL){
        count++;
        print_one_goods(&currentNode->data,count);
        currentNode = currentNode->next;
    }
    printf("--------------------------------------------------------------------------------------------------------------------------------\n");
    printf("total goods: %d\n",count);

    return count;
}

int get_goods_count(LinkList head)
{
    int count = 0;
    if(head == NULL){
        return 0;
    }

    Node* currentNode = head->next;
    while(currentNode != NULL){
        count++;
        currentNode = currentNode->next;
    }
    return count;
}
