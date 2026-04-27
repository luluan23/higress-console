FROM nginx:1.19.2-alpine as final

RUN sed -i "s/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g" /etc/apk/repositories \
        && apk add --update --no-cache ca-certificates tzdata bash curl busybox-extras

ENV TZ Asia/Shanghai
SHELL ["/bin/bash", "-c"]
VOLUME /data

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
