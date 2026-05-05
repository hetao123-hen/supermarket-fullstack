import struct
import zlib

def create_png(width, height, color):
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(chunk) & 0xffffffff)
        return struct.pack('>I', len(data)) + chunk + crc

    signature = b'\x89PNG\r\n\x1a\n'

    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = make_chunk(b'IHDR', ihdr_data)

    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'
        for x in range(width):
            raw_data += bytes(color)

    compressed = zlib.compress(raw_data)
    idat = make_chunk(b'IDAT', compressed)

    iend = make_chunk(b'IEND', b'')

    return signature + ihdr + idat + iend

indigo = (79, 70, 229)
png_data = create_png(256, 256, indigo)

with open('icon.png', 'wb') as f:
    f.write(png_data)

# Also create a 32x32 icon for the installer
png_data_32 = create_png(32, 32, indigo)
with open('icon.ico', 'wb') as f:
    f.write(png_data_32)

print("Icons generated: icon.png (256x256), icon.ico (32x32)")
