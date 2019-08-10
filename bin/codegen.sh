#!/usr/bin/env bash

yarn gql-gen

sed -ri 's/Maybe<\Array<Maybe<(.*)>>>/Maybe<\1[]>/g' src/graphql/types.ts
