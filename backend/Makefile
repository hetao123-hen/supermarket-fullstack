CC = gcc
CFLAGS = -Wall -Wextra -I./include -std=c11
LDFLAGS =

SRC_DIR = src
OBJ_DIR = obj
BIN_DIR = bin

SRCS = $(wildcard $(SRC_DIR)/*.c)
OBJS = $(patsubst $(SRC_DIR)/%.c,$(OBJ_DIR)/%.o,$(SRCS))
TARGET = $(BIN_DIR)/supermarket.exe

ifeq ($(OS),Windows_NT)
MKDIR_P = if not exist "$(1)" mkdir "$(1)"
RM_RF = if exist "$(1)" rmdir /s /q "$(1)"
else
MKDIR_P = mkdir -p "$(1)"
RM_RF = rm -rf "$(1)"
endif

.PHONY: all clean run

all: $(TARGET)

$(TARGET): $(OBJS) | $(BIN_DIR)
	$(CC) $(OBJS) -o $(TARGET) $(LDFLAGS)
	@echo "Build complete: $(TARGET)"

$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)
	$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR):
	$(call MKDIR_P,$(OBJ_DIR))

$(BIN_DIR):
	$(call MKDIR_P,$(BIN_DIR))

run: $(TARGET)
	$(TARGET)

clean:
	$(call RM_RF,$(OBJ_DIR))
	$(call RM_RF,$(BIN_DIR))
	@echo "Clean complete"
