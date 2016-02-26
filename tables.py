from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import func
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime)

Base = declarative_base()

class CommonColumns(Base):
    __abstract__ = True

    _created    = Column(DateTime, default=func.now())
    _updated    = Column(DateTime, default=func.now(), onupdate=func.now())
    _etag       = Column(String(40))

    @hybrid_property
    def _id(self):
        return self.id

class Users(CommonColumns):
    __tablename__ = 'users'

    id          = Column(Integer, primary_key=True, autoincrement=True)
    username    = Column(String(256))
    password    = Column(String(256))
    admin       = Column(Boolean)

class Resources(CommonColumns):
    __tablename__ = 'resources'

    id          = Column(Integer, primary_key=True, autoincrement=True)
    name        = Column(String(256))

class Cards(CommonColumns):
    __tablename__ = 'cards'

    id          = Column(Integer, primary_key=True, autoincrement=True)
    uuid        = Column(String(256))
    member      = Column(String(256))
    resources   = Column(String(256))
