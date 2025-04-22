#!/bin/bash

# COILED n-tasks 1
# COILED --region us-west-2
# COILED --forward-aws-credentials
# COILED --vm-type m6a.4xlarge
# COILED --tag project=OCR
# COILED container quay.io/carbonplan/ocr:2025.04.17 

# Note! Image does not work with ARM instances.

# schlep to local disk
# s5cmd cp --sp 's3://carbonplan-share/vector_web/geoparquet/LA_region/LA_rgs_1mb.parquet' 'LA_rgs_1mb.parquet'

# can we do this without a copy to disk?
# gpq convert --to=geojson LA_rgs_1mb.parquet | tippecanoe  -f -P --drop-smallest-as-needed --extend-zooms-if-still-dropping -zg -o LA_rgs_1mb.pmtiles

gpq convert --to=geojson https://carbonplan-share.s3.us-west-2.amazonaws.com/vector_web/geoparquet/LA_region/LA_rgs_1mb.parquet | tippecanoe  -f -P --drop-smallest-as-needed --extend-zooms-if-still-dropping -zg -o LA_rgs_1mb.pmtiles

s5cmd cp --sp 'LA_rgs_1mb.pmtiles' 's3://carbonplan-share/vector_web/pmtiles/LA_region/LA_rgs_1mb.pmtiles'
