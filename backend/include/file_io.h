#ifndef FILE_IO_H
#define FILE_IO_H

#include "goods.h"

int Load_Goods_From_File(LinkList head,const char* FileName);
int Save_Goods_To_File(LinkList head,const char* FileName);
int Load_Goods_From_DB(LinkList head,const char* FileName);
int Save_Goods_To_DB(LinkList head,const char* FileName);
Node* init_head_node();

#endif
