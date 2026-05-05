#ifndef UTILS_H
#define UTILS_H

#include "goods.h"

typedef enum sortbywhat{
    ID,
    PROFIT,
    IMPORT_TIME
} sortbywhat;

typedef enum howtosort{
    ASENDING,
    DESCENDING
} howtosort;

void sort_goods_by_id(LinkList head,howtosort order);
void sort_goods_by_profit(LinkList head,howtosort order);
void sort_goods_by_import_time(LinkList head,howtosort order);
void sort_goods_by_type(LinkList head,sortbywhat type,howtosort order);
void free_whole_list(LinkList head);
int input_valid_int();
float input_valid_float();
void input_valid_string(char* buffer,int size);
int input_optional_string(char* buffer,int size);
int input_optional_int(int* out_value);
int input_optional_float(float* out_value);
void clear_input_buffer();

#endif
