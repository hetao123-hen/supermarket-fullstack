#ifndef GOODS_H
#define GOODS_H

#include <stddef.h>

typedef struct Goods{
    char name[50];
    char id[50];
    float purchase_price;
    float original_sell_price;
    float discount;
    float discounted_sell_price;
    float profit;
    int quantity;
    long import_time;
}Goods;

typedef struct Node{
    Goods data;
    struct Node* next;
}Node,*LinkList;

int add_goods(LinkList head,Goods new_goods);
int delete_goods(LinkList head,const char* id);
int update_goods(LinkList head,const char* id,Goods updated_goods);
Node* find_goods_by_id(LinkList head,const char* id);
int find_goods_index_by_id(LinkList head,const char* id);
int kmp_match(const char* text,const char* pattern);
void print_goods_header();
void print_one_goods(const Goods* goods,int index);
int print_goods_list(LinkList head);
int get_goods_count(LinkList head);

#endif
