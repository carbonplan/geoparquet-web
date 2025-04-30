
#!/bin/bash

# COILED container quay.io/carbonplan/ocr:2025.04.17 
# COILED n-tasks 1
# COILED region us-west-2
# COILED --forward-aws-credentials
# COILED --tag project=OCR
# COILED --vm-type m6a.4xlarge
# COILED --disk-size 250





# schlep to local disk
s5cmd cp --sp 's3://carbonplan-share/vector_web/geoparquet/input/Conus_overture_buildings_RGS_200000.parquet' 'CONUS_overture_buildings.parquet'

echo download parquet checkpoint

ogr2ogr -progress -f FlatGeobuf \
CONUS_overture_buildings.fgb  \
CONUS_overture_buildings.parquet \
-nlt PROMOTE_TO_MULTI \

echo s5cmd built FGB checkpoint

# schlep to s3
s5cmd cp --sp 'CONUS_overture_buildings.fgb' 's3://carbonplan-share/vector_web/flatgeobuff/CONUS/CONUS_overture_buildings.fgb'

