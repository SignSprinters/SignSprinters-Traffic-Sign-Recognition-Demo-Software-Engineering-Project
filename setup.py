from setuptools import setup, find_packages

setup(
    name="signssprinters-tsrs",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "flask>=2.0.0",
        "tensorflow>=2.8.0",
        "pytest>=6.0.0"
    ],
    author="SignSprinters Team",
    description="Traffic Sign Recognition System Demo"
)
