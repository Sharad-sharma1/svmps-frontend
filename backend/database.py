from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

#local 
URL_DATABASE = 'mysql+pymysql://root:root@localhost:3306/myapp'

#live
# URL_DATABASE = 'mysql+pymysql://sql12785307:AxFIQBvdf6@sql12.freesqldatabase.com:3306/sql12785307'

engine = create_engine(URL_DATABASE)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()