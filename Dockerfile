# Multi-stage
# 1) Node image for building frontend assets
# 2) nginx stage to serve frontend assets

# Name the node stage "builder"
FROM node:14 AS builder
# Set working directory
WORKDIR /app
# Copy all files from current directory to working dir in image
COPY . .
# Env Values
ARG GATSBY_ALGOLIA_APP_ID: ${{ secrets.GATSBY_ALGOLIA_APP_ID }}
ARG GATSBY_ALGOLIA_INDEX_NAME: ${{ secrets.GATSBY_ALGOLIA_INDEX_NAME }}
ARG GATSBY_ALGOLIA_SEARCH_KEY: ${{ secrets.GATSBY_ALGOLIA_SEARCH_KEY }}
ARG ALGOLIA_ADMIN_KEY: ${{ secrets.GATSBY_ALGOLIA_ADMIN_KEY }}
ARG AIRTABLE_API_KEY: ${{ secrets.AIRTABLE_API_KEY }}
ARG AIRTABLE_POSTS_BASEID: ${{ secrets.AIRTABLE_POSTS_BASEID }}
ARG AIRTABLE_POSTS_TABLENAME: ${{ secrets.AIRTABLE_POSTS_TABLENAME }}
ARG AIRTABLE_QUALIFICATIONS_TABLENAME: ${{ secrets.AIRTABLE_QUALIFICATIONS_TABLENAME }}
ARG AIRTABLE_WEBSITES_TABLENAME: ${{ secrets.AIRTABLE_WEBSITES_TABLENAME }}
# install node modules and build assets
RUN yarn install && yarn build

# nginx state for serving content
FROM nginx:alpine
# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
# Copy static assets from builder stage
COPY --from=builder /app/public .
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]