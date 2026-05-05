#include "file_io.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

static int append_goods_node(LinkList head,const Goods* goods)
{
    if(head == NULL || goods == NULL){
        return -1;
    }

    Node* newNode = (Node*)malloc(sizeof(Node));
    if(newNode == NULL){
        perror("failed to allocate memory");
        return -1;
    }

    newNode->data = *goods;
    newNode->next = NULL;

    Node* tail = head;
    while(tail->next != NULL){
        tail = tail->next;
    }
    tail->next = newNode;

    return 0;
}

int Load_Goods_From_File(LinkList head,const char* FileName)
{
    FILE* file = fopen(FileName,"r");
    if(file == NULL){
        return -1;
    }

    int loaded_count = 0;
    char line[512];

    while(fgets(line,sizeof(line),file) != NULL){
        Goods temp;
        long import_time = 0;
        memset(&temp,0,sizeof(Goods));

        int fields = sscanf(line,
                            "%49s %49s %f %f %f %f %f %d %ld",
                            temp.name,
                            temp.id,
                            &temp.purchase_price,
                            &temp.original_sell_price,
                            &temp.discount,
                            &temp.discounted_sell_price,
                            &temp.profit,
                            &temp.quantity,
                            &import_time);

        if(fields == 8){
            temp.import_time = (long)time(NULL) + loaded_count;
        }else if(fields == 9){
            temp.import_time = import_time;
        }else{
            continue;
        }

        if(append_goods_node(head,&temp) == 0){
            loaded_count++;
        }
    }

    fclose(file);
    return loaded_count > 0 ? 1 : 0;
}

int Save_Goods_To_File(LinkList head,const char* FileName)
{
    FILE* file = fopen(FileName,"w");
    if(file == NULL){
        perror("cannot open text file");
        return -1;
    }

    Node* currentNode = head->next;
    while(currentNode != NULL){
        Goods temp = currentNode->data;
        fprintf(file,
                "%s %s %f %f %f %f %f %d %ld\n",
                temp.name,
                temp.id,
                temp.purchase_price,
                temp.original_sell_price,
                temp.discount,
                temp.discounted_sell_price,
                temp.profit,
                temp.quantity,
                temp.import_time);
        currentNode = currentNode->next;
    }

    fclose(file);
    return 1;
}

int Load_Goods_From_DB(LinkList head,const char* FileName)
{
    FILE* file = fopen(FileName,"rb");
    if(file == NULL){
        return 0;
    }

    Goods temp;
    while(fread(&temp,sizeof(Goods),1,file) == 1){
        if(append_goods_node(head,&temp) != 0){
            fclose(file);
            return -1;
        }
    }

    if(ferror(file)){
        perror("failed while reading db file");
        fclose(file);
        return -1;
    }

    fclose(file);
    return 1;
}

int Save_Goods_To_DB(LinkList head,const char* FileName)
{
    FILE* file = fopen(FileName,"wb");
    if(file == NULL){
        perror("cannot open db file");
        return -1;
    }

    Node* currentNode = head->next;
    while(currentNode != NULL){
        if(fwrite(&currentNode->data,sizeof(Goods),1,file) != 1){
            perror("failed while writing db file");
            fclose(file);
            return -1;
        }
        currentNode = currentNode->next;
    }

    fclose(file);
    return 1;
}

Node* init_head_node()
{
    Node* head = (Node*)malloc(sizeof(Node));
    if(head == NULL)
    {
        perror("failed to init head node");
        return NULL;
    }

    memset(&head->data,0,sizeof(Goods));
    head->next = NULL;
    return head;
}
