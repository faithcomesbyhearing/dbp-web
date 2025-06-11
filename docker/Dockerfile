# ──────────────────────────────────────────────
# Stage 1: Build on AL2 x86_64 (CodeBuild image)
# ──────────────────────────────────────────────
FROM public.ecr.aws/codebuild/amazonlinux-x86_64-standard:5.0 AS builder
WORKDIR /usr/src/app

# 1) Install core tools + NodeSource setup
RUN yum -y update
RUN yum -y install tar

ENV NODE_VERSION 22.15.1
ADD https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz /usr/src/app/node.tar.xz
RUN tar -xJf node.tar.xz -C /usr/local --strip-components=1 \
 && rm node.tar.xz

RUN npm install -g npm@11.4.0
RUN npm --version

# 2) Install deps
COPY package.json yarn.lock* package-lock.json* ./
COPY internals/scripts ./internals/scripts

RUN npm install

# 3) Build production bundle
COPY . .
RUN npm run build


# ──────────────────────────────────────────────
# Stage 2: Runtime on AL2023 x86_64 (EB platform)
# ──────────────────────────────────────────────
FROM public.ecr.aws/amazonlinux/amazonlinux:2023
WORKDIR /usr/src/app

# 1) Install only tar + xz (needed for .tar.xz)
RUN yum -y install tar xz \
 && yum clean all && rm -rf /var/cache/yum

# 2) Pull down the official Node.js v22.15.1 Linux x64 tarball and extract it
ENV NODE_VERSION 22.15.1
ADD https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz /usr/src/app/node.tar.xz
RUN tar -xJf node.tar.xz -C /usr/local --strip-components=1 \
 && rm node.tar.xz

# 3) Copy built app and run
COPY --from=builder /usr/src/app ./

EXPOSE 3000
CMD ["npm", "start"]
