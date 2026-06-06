use axum::{routing::get, Router};
use std::net::SocketAddr;

async fn root() -> &'static str {
    "Hello from ArchiTech Rust!"
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(root));

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("🚀 Server running on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_services())
        .await
        .expect("Failed to start server");
}