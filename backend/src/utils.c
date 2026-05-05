#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int is_cancel_token(const char* text)
{
    return (text != NULL) &&
           ((strcmp(text,"q") == 0) || (strcmp(text,"Q") == 0));
}

static Node* findmid(Node* head)
{
    Node* slow = head;
    Node* fast = head->next;

    while(fast != NULL && fast->next != NULL){
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}

static int compare_goods(const Goods* left,const Goods* right,sortbywhat type)
{
    if(type == PROFIT){
        if(left->profit < right->profit) return -1;
        if(left->profit > right->profit) return 1;
        return strcmp(left->id,right->id);
    }

    if(type == IMPORT_TIME){
        if(left->import_time < right->import_time) return -1;
        if(left->import_time > right->import_time) return 1;
        return strcmp(left->id,right->id);
    }

    return strcmp(left->id,right->id);
}

static Node* merge(Node* left,Node* right,sortbywhat type,howtosort order)
{
    Node dummy;
    Node* tail = &dummy;
    dummy.next = NULL;

    while(left != NULL && right != NULL){
        int cmp = compare_goods(&left->data,&right->data,type);
        int take_left = 0;

        if(order == ASENDING){
            take_left = (cmp <= 0);
        }else{
            take_left = (cmp >= 0);
        }

        if(take_left){
            tail->next = left;
            left = left->next;
        }else{
            tail->next = right;
            right = right->next;
        }
        tail = tail->next;
    }

    if(left != NULL){
        tail->next = left;
    }else{
        tail->next = right;
    }

    return dummy.next;
}

static Node* merge_sort(Node** head,sortbywhat type,howtosort order)
{
    if(*head == NULL || (*head)->next == NULL){
        return *head;
    }

    Node* mid = findmid(*head);
    Node* left = *head;
    Node* right = mid->next;

    mid->next = NULL;

    left = merge_sort(&left,type,order);
    right = merge_sort(&right,type,order);

    *head = merge(left,right,type,order);
    return *head;
}

void sort_goods_by_type(LinkList head,sortbywhat type,howtosort order)
{
    if(head == NULL || head->next == NULL){
        return;
    }

    Node* sort_list = head->next;
    head->next = merge_sort(&sort_list,type,order);
}

void sort_goods_by_id(LinkList head,howtosort order)
{
    sort_goods_by_type(head,ID,order);
}

void sort_goods_by_profit(LinkList head,howtosort order)
{
    sort_goods_by_type(head,PROFIT,order);
}

void sort_goods_by_import_time(LinkList head,howtosort order)
{
    sort_goods_by_type(head,IMPORT_TIME,order);
}

void free_whole_list(LinkList head)
{
    Node* currentNode = head;
    while(currentNode != NULL){
        Node* temp = currentNode;
        currentNode = currentNode->next;
        free(temp);
    }
}

int input_valid_int()
{
    int value;
    while(1){
        if(scanf("%d",&value) == 1){
            clear_input_buffer();
            return value;
        }else{
            printf("invalid integer input, please retry: ");
            clear_input_buffer();
        }
    }
}

float input_valid_float()
{
    float value;
    while(1){
        if(scanf("%f",&value) == 1){
            clear_input_buffer();
            return value;
        }else{
            printf("invalid float input, please retry: ");
            clear_input_buffer();
        }
    }
}

int input_optional_string(char* buffer,int size)
{
    if(buffer == NULL || size <= 1){
        return 0;
    }

    while(1){
        if(fgets(buffer,size,stdin) == NULL){
            clearerr(stdin);
            continue;
        }

        size_t len = strlen(buffer);
        if(len > 0 && buffer[len - 1] == '\n'){
            buffer[len - 1] = '\0';
        }else{
            clear_input_buffer();
        }

        if(is_cancel_token(buffer)){
            return 0;
        }

        if(strlen(buffer) == 0){
            printf("input cannot be empty, please retry (or q to cancel): ");
            continue;
        }
        return 1;
    }
}

int input_optional_int(int* out_value)
{
    if(out_value == NULL){
        return 0;
    }

    char line[128];
    while(1){
        if(fgets(line,sizeof(line),stdin) == NULL){
            clearerr(stdin);
            continue;
        }

        size_t len = strlen(line);
        if(len > 0 && line[len - 1] == '\n'){
            line[len - 1] = '\0';
        }else{
            clear_input_buffer();
        }

        if(is_cancel_token(line)){
            return 0;
        }

        int value = 0;
        char extra = '\0';
        if(sscanf(line,"%d %c",&value,&extra) == 1){
            *out_value = value;
            return 1;
        }

        printf("invalid integer input, please retry (or q to cancel): ");
    }
}

int input_optional_float(float* out_value)
{
    if(out_value == NULL){
        return 0;
    }

    char line[128];
    while(1){
        if(fgets(line,sizeof(line),stdin) == NULL){
            clearerr(stdin);
            continue;
        }

        size_t len = strlen(line);
        if(len > 0 && line[len - 1] == '\n'){
            line[len - 1] = '\0';
        }else{
            clear_input_buffer();
        }

        if(is_cancel_token(line)){
            return 0;
        }

        float value = 0.0f;
        char extra = '\0';
        if(sscanf(line,"%f %c",&value,&extra) == 1){
            *out_value = value;
            return 1;
        }

        printf("invalid float input, please retry (or q to cancel): ");
    }
}

void input_valid_string(char* buffer,int size)
{
    if(buffer == NULL || size <= 1){
        return;
    }

    while(1){
        if(fgets(buffer,size,stdin) == NULL){
            clearerr(stdin);
            continue;
        }
        size_t len = strlen(buffer);
        if(len > 0 && buffer[len - 1] == '\n'){
            buffer[len - 1] = '\0';
        }else{
            clear_input_buffer();
        }

        if(strlen(buffer) == 0){
            printf("input cannot be empty, please retry: ");
            continue;
        }
        return;
    }
}

void clear_input_buffer()
{
    int c;
    while((c = getchar()) != '\n' && c != EOF);
    clearerr(stdin);
}
