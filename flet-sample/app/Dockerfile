# ビルド用のイメージを作成 #
FROM python:3.11-slim-bookworm AS build

# Flutterを導入 #
WORKDIR /flutter

RUN apt-get update
RUN apt-get install -y curl git unzip

# 変数の定義
ARG FLUTTER_SDK=/usr/local/flutter
ARG FLUTTER_VERSION=3.19.3

# flutterのインストール
RUN git clone https://github.com/flutter/flutter.git $FLUTTER_SDK
RUN cd $FLUTTER_SDK && git fetch && git checkout $FLUTTER_VERSION
ENV PATH="$FLUTTER_SDK/bin:$FLUTTER_SDK/bin/cache/dart-sdk/bin:${PATH}"

RUN flutter doctor -v

# fletアプリをビルド #
WORKDIR /app

COPY . .

RUN sed '/-e/d' requirements.lock > requirements.txt
RUN pip install -r requirements.txt && rm requirements.txt

RUN flet build web

# 実行用のイメージを作成 #
FROM python:3.11-slim-bookworm

EXPOSE 8000
ENV PORT=8000
WORKDIR /web
# ビルドしたファイルをコピー
COPY --from=build /app/build/web /web

ENTRYPOINT ["python", "-m", "http.server"]