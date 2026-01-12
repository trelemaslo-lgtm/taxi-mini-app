from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine("sqlite:///taxi.db", echo=False)
Session = sessionmaker(bind=engine)
Base = declarative_base()

class Ad(Base):
    __tablename__ = "ads"

    id = Column(Integer, primary_key=True)
    role = Column(String)      # driver / client
    name = Column(String)
    phone = Column(String)
    route = Column(String)
    mode = Column(String)      # now / wait / later
    price = Column(String)
    seats = Column(Integer)
    comment = Column(String)
    created_at = Column(Float)

    points = Column(Integer, default=0)
    lat = Column(Float)
    lon = Column(Float)

class Like(Base):
    __tablename__ = "likes"
    id = Column(Integer, primary_key=True)
    ad_id = Column(Integer)
    user_id = Column(String)

def init_db():
    Base.metadata.create_all(engine)
