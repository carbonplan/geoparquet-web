# COILED n-tasks 1
# COILED --region us-west-2
# COILED --forward-aws-credentials
# COILED --vm-type r8g.2xlarge
import boto3
import duckdb
from gpq_utils.utils import apply_s3_creds, install_load_extensions

# apply our s3 creds and load duckdb extensions
install_load_extensions()
apply_s3_creds()


s2_level = 11
quadkey_partition = 8

input_conus_subset = "s3://carbonplan-share/vector_web/geoparquet/input/CA_overture_buildings.parquet"
output_path = f"s3://carbonplan-share/vector_web/geoparquet/CA/CA_s2_level_{s2_level}_partition_level_{quadkey_partition}_RGS5k.parquet"

duckdb.sql("""INSTALL spatial; LOAD spatial; INSTALL geography FROM community; LOAD geography;""")

res = duckdb.sql(f"""SET preserve_insertion_order = false; COPY (
        SELECT geometry, bbox, 
           ST_QuadKey(ST_Centroid(geometry), {quadkey_partition}) AS quadkey_{quadkey_partition},
            ST_Centroid(geometry).st_aswkb().s2_arbitrarycellfromwkb().s2_cell_parent({s2_level}) AS s2_cell_id
                     FROM read_parquet('{input_conus_subset}')
    ORDER BY quadkey_{quadkey_partition}, s2_cell_id  )
    TO '{output_path}'
    (FORMAT 'parquet',
    COMPRESSION 'zstd',
    ROW_GROUP_SIZE 5000,     
     PARTITION_BY quadkey_{quadkey_partition},
     OVERWRITE_OR_IGNORE true);
""")







