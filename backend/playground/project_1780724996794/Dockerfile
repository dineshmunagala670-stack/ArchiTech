FROM rust:1.75-slim AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/architech-rust-app .
EXPOSE 3000
CMD ["./architech-rust-app"]