from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = (
    "postgresql+psycopg2://neondb_owner:npg_MAJDqzi0Nvt1@"
    "ep-autumn-frog-adxfjews-pooler.c-2.us-east-1.aws.neon.tech/neondb"
    "?sslmode=require&channel_binding=require"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
