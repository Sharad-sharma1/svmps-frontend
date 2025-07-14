import pandas as pd
import math
import os

# File paths
csv_path = r"D:\aaaaaaaaaaaa\sharad_myprojects\svmps-frontend\svmps_data - Org_Main.csv"
output_dir = r"D:\aaaaaaaaaaaa\sharad_myprojects\svmps-frontend"
output_prefix = "insert_users_part_"

# Constants
BATCH_SIZE = 500

# Read the CSV
df = pd.read_csv(csv_path)

# Replace NaNs with empty strings for safety
df.fillna('', inplace=True)

# Prepare fixed/default values for other columns
def format_row(row):
    usercode = ""
    name = row["Name"]
    surname = row["Surname"]
    father_or_husband_name = row["Fathers Name"]
    mother_name = ""
    gender = ""
    birth_date = f"'{row['DOB']}'" if row["DOB"] else "NULL"
    mobile_no1 = str(row["Mob No"])
    mobile_no2 = ""
    fk_area_id = int(row["Area_ID"]) if row["Area_ID"] else "NULL"
    fk_village_id = int(row["Village_ID"]) if row["Village_ID"] else "NULL"
    address = row["Address"].replace("'", "''")
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
    user_type = row["Type"] if row["Type"] else "All"
    status = "Active"

    return f"('{usercode}', '{name}', '{surname}', '{father_or_husband_name}', '{mother_name}', '{gender}', {birth_date}, '{mobile_no1}', '{mobile_no2}', {fk_area_id}, {fk_village_id}, '{address}', '{pincode}', '{occupation}', '{country}', '{state}', '{email_id}', {active_flag}, {delete_flag}, {death_flag}, {receipt_flag}, '{receipt_no}', {receipt_date}, {receipt_amt}, '{user_type}', '{status}', now(), now())"

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
        death_flag, receipt_flag, receipt_no, receipt_date, receipt_amt,
        type, status, created_at, modified_at
    ) VALUES
{values_str};
"""

    # Write to file
    part_number = i + 1
    file_path = os.path.join(output_dir, f"{output_prefix}{part_number}.sql")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(sql)

print(f"✅ Generated {total_parts} SQL file(s) in:\n{output_dir}")
