# COILED n-tasks 1
# COILED --region us-west-2
# COILED --forward-aws-credentials
# COILED --vm-type i8g.2xlarge
# COILED --tag project=OCR

import duckdb
from gpq.utils import apply_s3_creds, install_load_extensions

# apply our s3 creds and load duckdb extensions
install_load_extensions()
apply_s3_creds()


# feel free to change defaults
RGS = '1mb'
quadkey_level = 10 # must be an valid quadkey level (int)

input_conus_subset = "s3://carbonplan-share/vector_web/geoparquet/input/CONUS_overture_buildings.parquet"
output_path = f"s3://carbonplan-share/vector_web/geoparquet/CONUS/CONUS_rgs_{RGS}_quadkey_{quadkey_level}.parquet"



result = duckdb.sql(f"""SET preserve_insertion_order = false; COPY (SELECT *, ST_QuadKey(ST_Centroid(geometry), {quadkey_level}) AS quadkey_{quadkey_level}
 FROM read_parquet('{input_conus_subset}')) TO '{output_path}'  (FORMAT 'parquet', ROW_GROUP_SIZE_BYTES '{RGS}',
COMPRESSION 'zstd',         
PARTITION_BY quadkey_{quadkey_level},
OVERWRITE_OR_IGNORE true);""")






