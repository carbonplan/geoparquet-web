# COILED n-tasks 1
# COILED --region us-west-2
# COILED --forward-aws-credentials
# COILED --vm-type m8g.8xlarge
# COILED --tag project=OCR

import duckdb
from gpq_utils.utils import apply_s3_creds, install_load_extensions

# apply s3 creds and load duckdb extensions
install_load_extensions()
apply_s3_creds()

s2_level = 15
quadkey_partition = 8
RGS = 5000 # really small RGS for web mapping
output_path = f"s3://carbonplan-share/vector_web/geoparquet/CONUS/CONUS_s2_level_{s2_level}_partition_level_{quadkey_partition}_RGS5k.parquet"

# CONUS bbox
bbox = (-125.354004, 24.413323, -66.555176, 49.196737)

# Current version of overture building data
overture_version = "2025-03-19.1"

# use the geography ext from the community extensions for s2.
duckdb.sql("""INSTALL geography FROM community; LOAD geography;""")

res = duckdb.sql(f"""SET preserve_insertion_order = false; COPY (
        SELECT geometry, bbox, 
        ST_QuadKey(ST_Centroid(geometry), {quadkey_partition}) AS quadkey_{quadkey_partition},
        ST_Centroid(geometry).st_aswkb().s2_arbitrarycellfromwkb().s2_cell_parent({s2_level}) AS s2_cell_id
                     FROM read_parquet('s3://overturemaps-us-west-2/release/{overture_version}/theme=buildings/type=building/*.parquet') WHERE
    bbox.xmin BETWEEN {bbox[0]} AND {bbox[2]} AND
    bbox.ymin BETWEEN {bbox[1]} AND {bbox[3]}
    ORDER BY quadkey_{quadkey_partition}, s2_cell_id )
    TO '{output_path}'
    (FORMAT 'parquet',
    COMPRESSION 'zstd',
    ROW_GROUP_SIZE {RGS},     
    PARTITION_BY quadkey_{quadkey_partition},
    OVERWRITE_OR_IGNORE true);
""")









