#include "inventory.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>

InventorySummary calculate_inventory_summary(LinkList head)
{
    InventorySummary summary;
    summary.total_sku = 0;
    summary.total_stock = 0;
    summary.total_value = 0.0f;
    summary.total_profit = 0.0f;
    summary.avg_profit_per_unit = 0.0f;
    summary.low_stock_count = 0;

    if(head == NULL || head->next == NULL){
        return summary;
    }

    Node* current = head->next;
    while(current != NULL){
        summary.total_sku++;
        summary.total_stock += current->data.quantity;
        summary.total_value += current->data.purchase_price * (float)current->data.quantity;
        summary.total_profit += current->data.profit;

        if(current->data.quantity <= LOW_STOCK_THRESHOLD){
            summary.low_stock_count++;
        }

        current = current->next;
    }

    if(summary.total_stock > 0){
        summary.avg_profit_per_unit = summary.total_profit / (float)summary.total_stock;
    }

    return summary;
}

void print_inventory_summary(LinkList head)
{
    InventorySummary s = calculate_inventory_summary(head);

    printf("\n================== INVENTORY SUMMARY ==================\n");
    printf("  Total SKUs          : %d\n", s.total_sku);
    printf("  Total Stock Qty     : %d\n", s.total_stock);
    printf("  Inventory Value     : $%.2f  (buy price x qty)\n", s.total_value);
    printf("  Potential Profit    : $%.2f\n", s.total_profit);
    printf("  Avg Profit / Unit   : $%.2f\n", s.avg_profit_per_unit);
    printf("  Low Stock Items     : %d  (qty <= %d)\n", s.low_stock_count, LOW_STOCK_THRESHOLD);
    printf("========================================================\n");
}

void print_low_stock_alerts(LinkList head, int threshold)
{
    if(head == NULL || head->next == NULL){
        printf("goods list is empty\n");
        return;
    }

    int count = 0;

    printf("\n================== LOW STOCK ALERTS (qty <= %d) ==================\n", threshold);
    printf("%-6s %-20s %-12s %-10s %-10s %-10s\n",
           "No.", "Name", "ID", "Qty", "Buy", "Sell");
    printf("---------------------------------------------------------------------\n");

    Node* current = head->next;
    int index = 0;
    while(current != NULL){
        index++;
        if(current->data.quantity <= threshold){
            count++;
            printf("%-6d %-20s %-12s %-10d $%-8.2f $%-8.2f\n",
                   count,
                   current->data.name,
                   current->data.id,
                   current->data.quantity,
                   current->data.purchase_price,
                   current->data.discounted_sell_price);
        }
        current = current->next;
    }

    printf("---------------------------------------------------------------------\n");

    if(count == 0){
        printf("  No low stock items found (all above %d)\n", threshold);
    }else{
        printf("  Total: %d item(s) below or at threshold\n", count);
    }
    printf("=====================================================================\n");
}

int compare_by_quantity_asc(const void* a, const void* b)
{
    const Goods* ga = (const Goods*)a;
    const Goods* gb = (const Goods*)b;
    return ga->quantity - gb->quantity;
}

void print_inventory_breakdown(LinkList head)
{
    if(head == NULL || head->next == NULL){
        printf("goods list is empty\n");
        return;
    }

    int count = get_goods_count(head);
    Goods* arr = (Goods*)malloc((size_t)count * sizeof(Goods));
    if(arr == NULL){
        printf("memory allocation failed\n");
        return;
    }

    Node* current = head->next;
    int idx = 0;
    while(current != NULL && idx < count){
        arr[idx++] = current->data;
        current = current->next;
    }

    qsort(arr, (size_t)count, sizeof(Goods), compare_by_quantity_asc);

    InventorySummary s = calculate_inventory_summary(head);

    printf("\n==================== INVENTORY BREAKDOWN ====================\n");
    printf("%-4s %-18s %-10s %-8s %-10s %-10s %-10s %-8s\n",
           "No.", "Name", "ID", "Qty", "Unit Cost", "Total Cost", "Sell Price", "Margin");
    printf("---------------------------------------------------------------------\n");

    for(int i = 0; i < count; i++){
        float total_cost = arr[i].purchase_price * (float)arr[i].quantity;
        float margin = (total_cost > 0.0f)
            ? (arr[i].profit / total_cost) * 100.0f
            : 0.0f;

        char qty_str[16];
        if(arr[i].quantity <= LOW_STOCK_THRESHOLD){
            snprintf(qty_str, sizeof(qty_str), "*%d*", arr[i].quantity);
        }else{
            snprintf(qty_str, sizeof(qty_str), "%d", arr[i].quantity);
        }

        printf("%-4d %-18s %-10s %-8s $%-8.2f $%-9.2f $%-9.2f %-6.1f%%\n",
               i + 1,
               arr[i].name,
               arr[i].id,
               qty_str,
               arr[i].purchase_price,
               total_cost,
               arr[i].discounted_sell_price,
               margin);
    }

    printf("---------------------------------------------------------------------\n");
    printf("  Summary: %d SKUs | %d units | $%.2f value | $%.2f potential profit\n",
           s.total_sku, s.total_stock, s.total_value, s.total_profit);
    printf("==================================================================\n");

    free(arr);
}

void handle_inventory(LinkList head)
{
    int choice = 0;

    while(1){
        printf("\n============ INVENTORY ANALYSIS ============\n");
        printf("1. Inventory Summary\n");
        printf("2. Low Stock Alerts\n");
        printf("3. Inventory Breakdown\n");
        printf("4. Back to Main Menu\n");
        printf("============================================\n");
        printf("input: ");

        choice = input_valid_int();

        switch(choice){
            case 1:
                print_inventory_summary(head);
                printf("\npress Enter to continue...");
                getchar();
                break;
            case 2:
                print_low_stock_alerts(head, LOW_STOCK_THRESHOLD);
                printf("\npress Enter to continue...");
                getchar();
                break;
            case 3:
                print_inventory_breakdown(head);
                printf("\npress Enter to continue...");
                getchar();
                break;
            case 4:
                printf("returning to main menu\n");
                return;
            default:
                printf("invalid choice, please try again\n");
                break;
        }
    }
}
