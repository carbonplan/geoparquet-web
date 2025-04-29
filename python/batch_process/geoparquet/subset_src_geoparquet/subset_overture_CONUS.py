# COILED n-tasks 1
# COILED --region us-west-2
# COILED --forward-aws-credentials
# COILED --vm-type i8g.2xlarge
# COILED --disk-size 10
# COILED --tag project=OCR

import duckdb
from gpq.utils import apply_s3_creds, install_load_extensions

# apply our s3 creds and load duckdb extensions
install_load_extensions()
apply_s3_creds()


# CONUS subset
bbox = (-125.354004, 24.413323, -66.555176, 49.196737)


# This can be updated
overture_version = "2025-03-19.1"

RGS = 200000 # https://github.com/opengeospatial/geoparquet/pull/254/files
subset_output_path = f"s3://carbonplan-share/vector_web/geoparquet/input/Conus_overture_buildings_RGS_{RGS}.parquet"


result = duckdb.sql(f"""SET preserve_insertion_order = false; COPY (SELECT subtype, height, roof_material, facade_material, facade_color, roof_shape, roof_orientation, geometry, bbox FROM read_parquet('s3://overturemaps-us-west-2/release/{overture_version}/theme=buildings/type=building/*.parquet')
WHERE
bbox.xmin BETWEEN {bbox[0]} AND {bbox[2]} AND
bbox.ymin BETWEEN {bbox[1]} AND {bbox[3]} ) TO '{subset_output_path}'  (FORMAT 'parquet', COMPRESSION 'zstd', ROW_GROUP_SIZE '{RGS}', OVERWRITE_OR_IGNORE true);""")





