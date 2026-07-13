--
-- PostgreSQL database dump
--

\restrict 8OKf3kToZkr0PU1jm0WuroKl6LdV5I0QK2wHXgVOHyGDkNK5qYzEQmdZFJiqeJc

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-07-08 12:14:35

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 16415)
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    location_id integer NOT NULL,
    check_in_time timestamp without time zone NOT NULL,
    check_out_time timestamp without time zone,
    status text DEFAULT 'Active'::text NOT NULL,
    duration integer DEFAULT 0
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16414)
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_id_seq OWNER TO postgres;

--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 222
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- TOC entry 225 (class 1259 OID 16441)
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_requests (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    leave_type text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text DEFAULT 'Pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leave_requests OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16440)
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_requests_id_seq OWNER TO postgres;

--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 224
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- TOC entry 221 (class 1259 OID 16402)
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id integer NOT NULL,
    location_name text NOT NULL,
    qr_code_secret text NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16401)
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.locations_id_seq OWNER TO postgres;

--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 220
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- TOC entry 227 (class 1259 OID 16463)
-- Name: overtime_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.overtime_records (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    record_date date NOT NULL,
    hours_worked numeric(4,2) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.overtime_records OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16462)
-- Name: overtime_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.overtime_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.overtime_records_id_seq OWNER TO postgres;

--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 226
-- Name: overtime_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.overtime_records_id_seq OWNED BY public.overtime_records.id;


--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    role text DEFAULT 'Personel'::text NOT NULL,
    department text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- TOC entry 4879 (class 2604 OID 16418)
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- TOC entry 4882 (class 2604 OID 16444)
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- TOC entry 4877 (class 2604 OID 16405)
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- TOC entry 4885 (class 2604 OID 16466)
-- Name: overtime_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records ALTER COLUMN id SET DEFAULT nextval('public.overtime_records_id_seq'::regclass);


--
-- TOC entry 5054 (class 0 OID 16415)
-- Dependencies: 223
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, user_id, location_id, check_in_time, check_out_time, status, duration) FROM stdin;
1	74ba19df-7592-491b-90f7-123e456789ab	1	2026-07-08 08:00:00	2026-07-08 17:00:00	Completed	540
2	74ba19df-7592-491b-90f7-123e456789ab	1	2026-07-08 08:00:00	2026-07-08 17:00:00	Completed	540
\.


--
-- TOC entry 5056 (class 0 OID 16441)
-- Dependencies: 225
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_requests (id, user_id, leave_type, start_date, end_date, status, created_at) FROM stdin;
\.


--
-- TOC entry 5052 (class 0 OID 16402)
-- Dependencies: 221
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, location_name, qr_code_secret, latitude, longitude, created_at) FROM stdin;
1	Merkez Bina Ana Giri\\u015f	gizli_merkez_kapisi_shf123	37.8749000	32.4932000	2026-07-08 11:45:59.230084
\.


--
-- TOC entry 5058 (class 0 OID 16463)
-- Dependencies: 227
-- Data for Name: overtime_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.overtime_records (id, user_id, record_date, hours_worked, description, created_at) FROM stdin;
\.


--
-- TOC entry 5050 (class 0 OID 16389)
-- Dependencies: 219
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, full_name, role, department, created_at) FROM stdin;
74ba19df-7592-491b-90f7-123e456789ab	Ahmet Y\\u0131lmaz	Personel	Bilgi \\u0130\\u015flem	2026-07-08 11:45:59.230084
\.


--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 222
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_id_seq', 2, true);


--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 224
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 1, false);


--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 220
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.locations_id_seq', 1, true);


--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 226
-- Name: overtime_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.overtime_records_id_seq', 1, false);


--
-- TOC entry 4892 (class 2606 OID 16429)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 4896 (class 2606 OID 16456)
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 16413)
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- TOC entry 4898 (class 2606 OID 16475)
-- Name: overtime_records overtime_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records
    ADD CONSTRAINT overtime_records_pkey PRIMARY KEY (id);


--
-- TOC entry 4888 (class 2606 OID 16400)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4893 (class 1259 OID 16481)
-- Name: idx_attendance_check_in; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_check_in ON public.attendance USING btree (check_in_time);


--
-- TOC entry 4894 (class 1259 OID 16482)
-- Name: idx_leave_start_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_start_date ON public.leave_requests USING btree (start_date);


--
-- TOC entry 4899 (class 2606 OID 16435)
-- Name: attendance fk_attendance_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_location FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- TOC entry 4900 (class 2606 OID 16430)
-- Name: attendance fk_attendance_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- TOC entry 4901 (class 2606 OID 16457)
-- Name: leave_requests fk_leave_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- TOC entry 4902 (class 2606 OID 16476)
-- Name: overtime_records fk_overtime_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records
    ADD CONSTRAINT fk_overtime_user FOREIGN KEY (user_id) REFERENCES public.profiles(id);


-- Completed on 2026-07-08 12:14:36

--
-- PostgreSQL database dump complete
--

\unrestrict 8OKf3kToZkr0PU1jm0WuroKl6LdV5I0QK2wHXgVOHyGDkNK5qYzEQmdZFJiqeJc

