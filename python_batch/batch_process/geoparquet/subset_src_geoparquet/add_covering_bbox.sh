#!/bin/bash

# COILED n-tasks 1
# COILED --region us-west-2
# COILED --forward-aws-credentials
# COILED --vm-type m8g.large
# COILED --tag project=OCR


# schlep to local disk
s5cmd cp --sp s3://carbonplan-share/vector_web/geoparquet/input/CA_overture_buildings_RGS_50000.parquet CA_overture_buildings_RGS_50000.parquet
uv run gt check all CA_overture_buildings_RGS_50000.parquet
s5cmd cp --sp CA_overture_buildings_RGS_50000.parquet s3://carbonplan-share/vector_web/geoparquet/input/CA_overture_buildings_RGS_50000.parquet