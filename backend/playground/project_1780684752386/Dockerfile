FROM gcc:latest
WORKDIR /usr/src/myapp
COPY . .
RUN apt-get update && apt-get install -y cmake
RUN cmake . && make
CMD ["./ArchiTechCppApp"]