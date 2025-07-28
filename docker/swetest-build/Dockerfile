# This Dockerfile builds swetest using the WASI SDK and wasi-vfs, producing a
# packed WebAssembly module that includes the necessary ephemeris files.
#
# The build is based on the swisseph library and includes a .diff patch to make it compatible with WASI.
# https://github.com/aloistr/swisseph
#
# The build process includes:
# 1. Installing dependencies (WASI SDK, Rust, etc.)
# 2. Cloning and building the wasi-vfs library
# 3. Cloning the swisseph library and applying a local patch
# 4. Compiling the swetest application to WebAssembly
# 5. Packing the ephemeris files using wasi-vfs
# 6. Optionally optimizing the WebAssembly output using wasm-opt and wasm-strip
# 7. Creating a compressed tarball of the final output
#
# Important notes:
# - Ubuntu version 24.04 and above is required for the build due to unavailability of certain packages in earlier versions.

FROM ubuntu:24.04 AS builder

WORKDIR /build

# Install dependencies
RUN apt-get update && apt-get install -y \
  wabt libc6 rustup curl unzip git cmake pkg-config libssl-dev build-essential \
  && apt-get clean

ENV WASI_OS=linux
ENV WASI_ARCH=x86_64
ENV WASI_VERSION=25
ENV WASI_VERSION_FULL=${WASI_VERSION}.0

# Install WASI SDK
RUN curl -LO "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${WASI_VERSION}/wasi-sdk-${WASI_VERSION_FULL}-${WASI_ARCH}-${WASI_OS}.tar.gz" && \
    tar xvf wasi-sdk-${WASI_VERSION_FULL}-${WASI_ARCH}-${WASI_OS}.tar.gz && \
    mv wasi-sdk-${WASI_VERSION_FULL}-${WASI_ARCH}-${WASI_OS} /opt/wasi-sdk

ENV WASI_SDK_PATH=/opt/wasi-sdk
ENV CC="${WASI_SDK_PATH}/bin/clang --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot"

# --------------------------------------------------------
# 1.2.1 Clone and build wasi-vfs
# --------------------------------------------------------
RUN git clone --recurse-submodules https://github.com/kateinoigakukun/wasi-vfs.git
WORKDIR /build/wasi-vfs
ENV CFLAGS_wasm32_unknown_unknown="--sysroot=/opt/wasi-sdk/share/wasi-sysroot -I /opt/wasi-sdk/share/wasi-sysroot/include/wasm32-wasi"
ENV CC_wasm32_unknown_unknown="/opt/wasi-sdk/bin/clang"
ENV AR_wasm32_unknown_unknown="/opt/wasi-sdk/bin/llvm-ar"

RUN rustup target add wasm32-unknown-unknown && \
    rustup target add wasm32-wasip1 && \
    (unset CC CFLAGS && cargo build --package wasi-vfs-cli) && \
    cargo build --target wasm32-unknown-unknown

# --------------------------------------------------------
# 1.2.3 Clone swisseph (assumes upstream layout is unchanged)
# --------------------------------------------------------
WORKDIR /build
RUN git clone https://github.com/aloistr/swisseph.git
WORKDIR /build/swisseph
# Get short commit hash and store it in a file
RUN touch /build/GIT_COMMIT && git rev-parse --short HEAD > /build/GIT_COMMIT

# --------------------------------------------------------
# 1.2.3.1 Apply local patch to swisseph
# --------------------------------------------------------
COPY ../../patches/swisseph-wasi.diff swisseph-wasi.diff
RUN git apply swisseph-wasi.diff

# --------------------------------------------------------
# 1.3 Prepare eph directory and copy files
# --------------------------------------------------------
RUN mkdir eph && \
    cp ephe/semo_18.se1 eph/semo_18.se1 && \
    cp ephe/sepl_18.se1 eph/sepl_18.se1

# --------------------------------------------------------
# 1.4 Compile swetest to WASM
# --------------------------------------------------------
RUN $CC \
    --target=wasm32-wasi \
		-Oz -DNDEBUG -ffunction-sections -fdata-sections \
		--sysroot=/opt/wasi-sdk/share/wasi-sysroot \
		-Wl,--no-entry -Wl,--export-all -Wl,--gc-sections \
		-Wl,--allow-undefined -D__WASI__ -I. -Iephe \
    swetest.c sweph.c swephlib.c swedate.c swehouse.c \
    swecl.c swehel.c swejpl.c swemplan.c swemmoon.c \
    /build/wasi-vfs/target/wasm32-unknown-unknown/debug/libwasi_vfs.a \
    -o /build/swetest.wasm

# --------------------------------------------------------
# 1.5 Pack eph files using wasi-vfs CLI
# --------------------------------------------------------
RUN chmod +x /build/wasi-vfs/target/debug/wasi-vfs && \
    /build/wasi-vfs/target/debug/wasi-vfs pack /build/swetest.wasm \
    --dir ./eph::/ephe \
    -o /build/swetest.packed.wasm

# --------------------------------------------------------
# Optional: install and use wasm-opt + wasm-strip
# --------------------------------------------------------
RUN curl -LO https://github.com/WebAssembly/binaryen/releases/download/version_116/binaryen-version_116-x86_64-linux.tar.gz && \
    tar -xzf binaryen-version_116-x86_64-linux.tar.gz && \
    mv binaryen-version_116/bin/* /usr/local/bin/

RUN wasm-strip /build/swetest.packed.wasm
RUN wasm-opt /build/swetest.packed.wasm \
      -Oz \
      --converge \
      --strip-debug \
      --strip-producers \
      --strip-dwarf \
      --vacuum \
      --merge-similar-functions \
      -o /build/swetest-latest.wasm

RUN cp /build/swetest-latest.wasm /build/swetest-$(cat /build/GIT_COMMIT).wasm

RUN tar -czf /build/swetest.wasm.tar.gz \
		/build/swetest-latest.wasm \
		/build/swetest-$(cat /build/GIT_COMMIT).wasm

# # --------------------------------------------------------
# # Final stage: copy only the optimized .wasm output
# # --------------------------------------------------------
FROM scratch AS export
COPY --from=builder /build/swetest.wasm.tar.gz /swetest.wasm.tar.gz
