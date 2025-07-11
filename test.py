import pandas as pd
import math
import os

# File paths
csv_path = r"D:\nice backup\practice\practice\svmps_project\svmps_frontend\svmps_data - ready to migrate user data.csv"
output_dir = r"D:\nice backup\practice\practice\svmps_project\svmps_frontend"
output_prefix = "insert_users_part_"

# Constants
BATCH_SIZE = 500

# Read the CSV
df = pd.read_csv(csv_path)

# Prepare fixed/default values for other columns
def format_row(row):
    usercode = ""
    name = row["NAME"]
    surname = ""
    father_or_husband_name = ""
    mother_name = ""
    gender = ""
    birth_date = "NULL"
    mobile_no1 = ""
    mobile_no2 = ""
    fk_area_id = row["area"]
    fk_village_id = row["village"]
    address = row["ADD"].replace("'", "''")
    pincode = ""
    occupation = ""
    country = "India"
    state = "Gujarat"
    email_id = ""
    active_flag = 'TRUE'
    delete_flag = 'FALSE'
    death_flag = 'FALSE'
    receipt_flag = 'FALSE'
    receipt_no = ""
    receipt_date = "NULL"
    receipt_amt = "0.00"

    return f"('{usercode}', '{name}', '{surname}', '{father_or_husband_name}', '{mother_name}', '{gender}', {birth_date}, '{mobile_no1}', '{mobile_no2}', {fk_area_id}, {fk_village_id}, '{address}', '{pincode}', '{occupation}', '{country}', '{state}', '{email_id}', {active_flag}, {delete_flag}, {death_flag}, {receipt_flag}, '{receipt_no}', {receipt_date}, {receipt_amt})"

# Generate insert statements in batches
rows = [format_row(row) for _, row in df.iterrows()]
total_parts = math.ceil(len(rows) / BATCH_SIZE)

for i in range(total_parts):
    batch_rows = rows[i * BATCH_SIZE: (i + 1) * BATCH_SIZE]
    values_str = ",\n".join(batch_rows)
    sql = f"""INSERT INTO public."user" (
        usercode, name, surname, father_or_husband_name, mother_name, gender, birth_date,
        mobile_no1, mobile_no2, fk_area_id, fk_village_id, address, pincode,
        occupation, country, state, email_id, active_flag, delete_flag,
        death_flag, receipt_flag, receipt_no, receipt_date, receipt_amt
    ) VALUES
{values_str};
"""

    # Write to file
    part_number = i + 1
    file_path = os.path.join(output_dir, f"{output_prefix}{part_number}.sql")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(sql)

print(f"✅ Generated {total_parts} SQL file(s) in:\n{output_dir}")
