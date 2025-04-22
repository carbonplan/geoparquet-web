
# COILED n-tasks 1
# COILED --region us-west-2
# COILED --forward-aws-credentials
# COILED --vm-type c8g.xlarge
# COILED --tag project=OCR

import duckdb
from gpq.utils import apply_s3_creds, install_load_extensions

# apply our s3 creds and load duckdb extensions
install_load_extensions()
apply_s3_creds()


# LA area
bbox = (-119.465332, 33.296446, -116.680298, 34.518839)

RGS = '1mb'
input_conus_subset = "s3://carbonplan-share/vector_web/geoparquet/input/CONUS_overture_buildings.parquet"
subset_output_path = f"s3://carbonplan-share/vector_web/geoparquet/LA_region/LA_rgs_{RGS}.parquet"

result = duckdb.sql(f"""SET preserve_insertion_order = false; COPY (SELECT * FROM read_parquet('{input_conus_subset}')
WHERE
bbox.xmin BETWEEN {bbox[0]} AND {bbox[2]} AND
bbox.ymin BETWEEN {bbox[1]} AND {bbox[3]} )  '{subset_output_path}'  (FORMAT 'parquet', ROW_GROUP_SIZE_BYTES '{RGS}',
COMPRESSION 'zstd', OVERWRITE_OR_IGNORE true);""")





