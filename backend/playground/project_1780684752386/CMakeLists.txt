cmake_minimum_required(VERSION 3.10)
project(ArchiTechCppApp)
set(CMAKE_CXX_STANDARD 17)

add_executable(ArchiTechCppApp src/main.cpp src/App.cpp)
target_include_directories(ArchiTechCppApp PRIVATE include)