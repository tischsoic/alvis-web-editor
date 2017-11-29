CREATE TABLE "user" (
    id serial NOT NULL,
    email varchar(256)  NOT NULL,
    password varchar(128)  NOT NULL, -- SHA-512 generates a 512-bit hash value. You can use CHAR(128)
    firstname varchar(256)  NOT NULL,
    lastname varchar(256)  NOT NULL,
    activated boolean NOT NULL,
    created_at timestamp  NOT NULL,
    updated_at timestamp  NOT NULL,
    deleted_at timestamp  NULL,
    CONSTRAINT user_pk PRIMARY KEY (id)
);

CREATE TABLE "file" (
    id serial NOT NULL,
    name varchar(256) NOT NULL,
    realtive_path varchar(2048)  NOT NULL,
    created_at timestamp  NOT NULL,
    updated_at timestamp  NOT NULL,
    deleted_at timestamp  NULL,
    CONSTRAINT file_pk PRIMARY KEY (id)
);