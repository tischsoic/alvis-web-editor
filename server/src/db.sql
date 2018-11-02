CREATE DATABASE alviswebeditor;
\c alviswebeditor

CREATE TABLE "user"
(
    id serial NOT NULL,
    email varchar(256) NOT NULL,
    password varchar(128) NOT NULL,
    -- SHA-512 generates a 512-bit hash value. You can use CHAR(128)
    firstname varchar(256) NOT NULL,
    lastname varchar(256) NOT NULL,
    activated boolean NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    deleted_at timestamp NULL,
    CONSTRAINT user_pk PRIMARY KEY (id)
);
CREATE TABLE "file"
(
    id serial NOT NULL,
    name varchar(256) NOT NULL,
    realtive_path varchar(2048) NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    deleted_at timestamp NULL,
    CONSTRAINT file_pk PRIMARY KEY (id)
);

-- password: admin hashed with SHA-512 with salt asw
INSERT INTO "user"
    (email, password, firstname, lastname, activated, created_at, updated_at)
VALUES(
    'admin@agh.edu.pl', 
    'f08ec64bb6cf6d9b5d38728ef53b429afb9b895cee9966d80d591f96c219a30c01b29a9df9077f974e44f1e239805b22261648d44dd595eb034d94ba1e280c4c',
    'Admin', 'Admin', true,
    now(), now()
    );

CREATE USER alviseditor WITH PASSWORD 'alviseditor';
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO alviseditor;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO alviseditor;
