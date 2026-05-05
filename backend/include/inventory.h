#ifndef INVENTORY_H
#define INVENTORY_H

#include "goods.h"

#define LOW_STOCK_THRESHOLD 10

typedef struct {
    int total_sku;
    int total_stock;
    float total_value;
    float total_profit;
    float avg_profit_per_unit;
    int low_stock_count;
} InventorySummary;

InventorySummary calculate_inventory_summary(LinkList head);
void print_inventory_summary(LinkList head);
void print_low_stock_alerts(LinkList head, int threshold);
void print_inventory_breakdown(LinkList head);
void handle_inventory(LinkList head);

#endif
