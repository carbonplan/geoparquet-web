# COILED n-tasks 1
# COILED --region us-west-2
# COILED --forward-aws-credentials
# COILED --vm-type r8g.xlarge
import boto3
import duckdb
from gpq_utils.utils import apply_s3_creds, install_load_extensions

# apply our s3 creds and load duckdb extensions
install_load_extensions()
apply_s3_creds()


quadkey_row_group = 13
quadkey_partition = 8

input_conus_subset = "s3://carbonplan-share/vector_web/geoparquet/input/CA_overture_buildings.parquet"
output_path = f"s3://carbonplan-share/vector_web/geoparquet/CA/CA_quadkey_sort_{quadkey_row_group}_partition_level_{quadkey_partition}.parquet"

result = duckdb.sql(f"""SET preserve_insertion_order = false; 
                    COPY 
                    (
                    SELECT *, 
                        ST_QuadKey(ST_Centroid(geometry), {quadkey_row_group}) AS quadkey_{quadkey_row_group},
                        ST_QuadKey(ST_Centroid(geometry), {quadkey_partition}) AS quadkey_{quadkey_partition}

                    FROM read_parquet('{input_conus_subset}')
                     ORDER BY quadkey_{quadkey_row_group})
  
    TO '{output_path}'  (FORMAT 'parquet',
COMPRESSION 'zstd',         
PARTITION_BY quadkey_{quadkey_partition},
OVERWRITE_OR_IGNORE true);""")


# fixed_level = 5

# partitions_fixed = con.sql(f"""
# SELECT
#     geom.st_aswkb().s2_arbitrarycellfromwkb().s2_cell_parent({fixed_level}) AS cell,
#     count(*) AS n,
#     s2_aswkb(cell::GEOGRAPHY).st_geomfromwkb() as geom
# FROM 'microsoft-buildings-point.parquet'
# GROUP BY
#     cell
# """)

# partitions_fixed_pd = partitions_fixed.to_pandas()