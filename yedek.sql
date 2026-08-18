--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2026-07-20 01:42:41

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 228 (class 1255 OID 16435)
-- Name: fn_audit_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_audit_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO audit_logs (table_name, operation, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_audit_log() OWNER TO postgres;

--
-- TOC entry 229 (class 1255 OID 16436)
-- Name: fn_calc_duration(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_calc_duration() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.check_out_time IS NOT NULL THEN
        NEW.duration := EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time)) / 60;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_calc_duration() OWNER TO postgres;

--
-- TOC entry 230 (class 1255 OID 16525)
-- Name: handle_attendance(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_attendance(p_user_id uuid, p_location_id integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    row_count INT;
BEGIN
    -- Önce insert yapmayı dene
    INSERT INTO public.attendance (user_id, location_id, check_in_time, status)
    VALUES (p_user_id, p_location_id, CURRENT_TIMESTAMP, 'Active');
    
    -- Insert kaç satır etkiledi bak
    GET DIAGNOSTICS row_count = ROW_COUNT;
    
    IF row_count > 0 THEN
        RETURN 'Basarili';
    ELSE
        RETURN 'Insert yapilmadi - Hata var';
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Hatanın gerçek sebebini döndür (Sessiz kalmasın)
    RAISE EXCEPTION 'Hata: %', SQLERRM;
END;
$$;


ALTER FUNCTION public.handle_attendance(p_user_id uuid, p_location_id integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16438)
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
-- TOC entry 218 (class 1259 OID 16445)
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
-- TOC entry 4864 (class 0 OID 0)
-- Dependencies: 218
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- TOC entry 219 (class 1259 OID 16446)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    table_name text NOT NULL,
    operation text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    changed_by text DEFAULT 'System_Admin'::text,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16453)
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- TOC entry 4865 (class 0 OID 0)
-- Dependencies: 220
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- TOC entry 221 (class 1259 OID 16454)
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
-- TOC entry 222 (class 1259 OID 16461)
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
-- TOC entry 4866 (class 0 OID 0)
-- Dependencies: 222
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- TOC entry 223 (class 1259 OID 16462)
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
-- TOC entry 224 (class 1259 OID 16468)
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
-- TOC entry 4867 (class 0 OID 0)
-- Dependencies: 224
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- TOC entry 225 (class 1259 OID 16469)
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
-- TOC entry 226 (class 1259 OID 16475)
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
-- TOC entry 4868 (class 0 OID 0)
-- Dependencies: 226
-- Name: overtime_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.overtime_records_id_seq OWNED BY public.overtime_records.id;


--
-- TOC entry 227 (class 1259 OID 16476)
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    role text DEFAULT 'Personel'::text NOT NULL,
    department text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    manager_id uuid,
    email character varying(255),
    password_hash character varying(255)
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- TOC entry 4668 (class 2604 OID 16483)
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- TOC entry 4671 (class 2604 OID 16484)
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- TOC entry 4674 (class 2604 OID 16485)
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- TOC entry 4677 (class 2604 OID 16486)
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- TOC entry 4679 (class 2604 OID 16487)
-- Name: overtime_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records ALTER COLUMN id SET DEFAULT nextval('public.overtime_records_id_seq'::regclass);


--
-- TOC entry 4848 (class 0 OID 16438)
-- Dependencies: 217
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, user_id, location_id, check_in_time, check_out_time, status, duration) FROM stdin;
82	a8d91bb0-38af-41a1-8976-699c84f4902a	1	2026-07-18 16:58:40.97959	\N	Active	0
83	0cb06133-52e7-4074-b3b1-88865036be3f	1	2026-07-18 16:58:40.97959	\N	Active	0
84	e0721fda-53d9-4dd5-b4ae-6a92bb4e1acd	1	2026-07-18 16:58:40.97959	\N	Active	0
85	7c96e5da-5452-4340-8435-b80c2819029c	1	2026-07-18 16:58:40.97959	\N	Active	0
86	8a6c424a-27b1-4123-958d-d74d257d28ca	1	2026-07-18 16:58:40.97959	\N	Active	0
87	87bd499c-eb07-46f2-b8cc-a26c0a5101a3	1	2026-07-18 16:58:40.97959	\N	Active	0
88	03afad1c-1eee-4771-a2e8-1b052a4af4a9	1	2026-07-18 16:58:40.97959	\N	Active	0
89	5a9bac3d-d679-4f69-8d11-fb0c084d5522	1	2026-07-18 16:58:40.97959	\N	Active	0
90	54347326-f7ca-4808-bf3d-60c4893829ba	1	2026-07-18 16:58:40.97959	\N	Active	0
91	a9bc9402-9d4c-452e-85e5-c5ad14905811	1	2026-07-18 16:58:40.97959	\N	Active	0
92	272375b1-9b73-485b-bcb1-9d4e69f752a6	1	2026-07-18 16:58:40.97959	\N	Active	0
93	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	1	2026-07-18 16:58:40.97959	\N	Active	0
94	d9844a83-fa0c-4bbc-835e-89ecad549c92	1	2026-07-18 16:58:40.97959	\N	Active	0
95	1cf886a9-5be0-4304-821f-17eb8bf9e0b3	1	2026-07-18 16:58:40.97959	\N	Active	0
96	6abacae4-4451-475a-8ffe-c8f139da5e88	1	2026-07-18 16:58:40.97959	\N	Active	0
\.


--
-- TOC entry 4850 (class 0 OID 16446)
-- Dependencies: 219
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, table_name, operation, old_data, new_data, changed_by, changed_at) FROM stdin;
1	leave_requests	UPDATE	{"id": 1, "status": "Pending", "user_id": "a8d91bb0-38af-41a1-8976-699c84f4902a", "end_date": "2026-07-21", "created_at": "2026-07-18T16:43:50.80408", "leave_type": "Yıllık İzin", "start_date": "2026-07-18"}	{"id": 1, "status": "Approved", "user_id": "a8d91bb0-38af-41a1-8976-699c84f4902a", "end_date": "2026-07-21", "created_at": "2026-07-18T16:43:50.80408", "leave_type": "Yıllık İzin", "start_date": "2026-07-18"}	System_Admin	2026-07-19 14:57:31.833235
2	leave_requests	UPDATE	{"id": 2, "status": "Pending", "user_id": "0cb06133-52e7-4074-b3b1-88865036be3f", "end_date": "2026-07-21", "created_at": "2026-07-18T16:43:50.80408", "leave_type": "Yıllık İzin", "start_date": "2026-07-18"}	{"id": 2, "status": "Approved", "user_id": "0cb06133-52e7-4074-b3b1-88865036be3f", "end_date": "2026-07-21", "created_at": "2026-07-18T16:43:50.80408", "leave_type": "Yıllık İzin", "start_date": "2026-07-18"}	System_Admin	2026-07-19 18:00:37.585078
3	leave_requests	UPDATE	{"id": 3, "status": "Pending", "user_id": "e0721fda-53d9-4dd5-b4ae-6a92bb4e1acd", "end_date": "2026-07-21", "created_at": "2026-07-18T16:43:50.80408", "leave_type": "Yıllık İzin", "start_date": "2026-07-18"}	{"id": 3, "status": "Rejected", "user_id": "e0721fda-53d9-4dd5-b4ae-6a92bb4e1acd", "end_date": "2026-07-21", "created_at": "2026-07-18T16:43:50.80408", "leave_type": "Yıllık İzin", "start_date": "2026-07-18"}	System_Admin	2026-07-19 18:39:59.590783
\.


--
-- TOC entry 4852 (class 0 OID 16454)
-- Dependencies: 221
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_requests (id, user_id, leave_type, start_date, end_date, status, created_at) FROM stdin;
1	a8d91bb0-38af-41a1-8976-699c84f4902a	Yıllık İzin	2026-07-18	2026-07-21	Approved	2026-07-18 16:43:50.80408
2	0cb06133-52e7-4074-b3b1-88865036be3f	Yıllık İzin	2026-07-18	2026-07-21	Approved	2026-07-18 16:43:50.80408
3	e0721fda-53d9-4dd5-b4ae-6a92bb4e1acd	Yıllık İzin	2026-07-18	2026-07-21	Rejected	2026-07-18 16:43:50.80408
\.


--
-- TOC entry 4854 (class 0 OID 16462)
-- Dependencies: 223
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, location_name, qr_code_secret, latitude, longitude, created_at) FROM stdin;
1	Ana Ofis	secret_1	37.0000000	32.0000000	2026-07-18 16:43:50.80408
2	Depo	secret_2	37.1000000	32.1000000	2026-07-18 16:43:50.80408
\.


--
-- TOC entry 4856 (class 0 OID 16469)
-- Dependencies: 225
-- Data for Name: overtime_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.overtime_records (id, user_id, record_date, hours_worked, description, created_at) FROM stdin;
1	a8d91bb0-38af-41a1-8976-699c84f4902a	2026-07-18	2.00	Fazla mesai	2026-07-18 16:43:50.80408
2	0cb06133-52e7-4074-b3b1-88865036be3f	2026-07-18	2.00	Fazla mesai	2026-07-18 16:43:50.80408
3	e0721fda-53d9-4dd5-b4ae-6a92bb4e1acd	2026-07-18	2.00	Fazla mesai	2026-07-18 16:43:50.80408
4	7c96e5da-5452-4340-8435-b80c2819029c	2026-07-18	2.00	Fazla mesai	2026-07-18 16:43:50.80408
5	8a6c424a-27b1-4123-958d-d74d257d28ca	2026-07-18	2.00	Fazla mesai	2026-07-18 16:43:50.80408
\.


--
-- TOC entry 4858 (class 0 OID 16476)
-- Dependencies: 227
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, full_name, role, department, created_at, manager_id, email, password_hash) FROM stdin;
a8d91bb0-38af-41a1-8976-699c84f4902a	Ahmet Yılmaz	User	IT	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
0cb06133-52e7-4074-b3b1-88865036be3f	Ayşe Demir	User	İnsan Kaynakları	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
e0721fda-53d9-4dd5-b4ae-6a92bb4e1acd	Mehmet Kaya	User	Finans	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
7c96e5da-5452-4340-8435-b80c2819029c	Fatma Çelik	User	Satış	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
8a6c424a-27b1-4123-958d-d74d257d28ca	Caner Erkin	User	Lojistik	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
87bd499c-eb07-46f2-b8cc-a26c0a5101a3	Selin Aydın	User	Yönetim	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
03afad1c-1eee-4771-a2e8-1b052a4af4a9	Deniz Vural	User	Pazarlama	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
5a9bac3d-d679-4f69-8d11-fb0c084d5522	Emre Şahin	User	Ar-Ge	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
54347326-f7ca-4808-bf3d-60c4893829ba	Zeynep Gök	User	IT	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
272375b1-9b73-485b-bcb1-9d4e69f752a6	Burak Can	User	Satış	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
d9844a83-fa0c-4bbc-835e-89ecad549c92	Ozan Güven	User	Muhasebe	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
1cf886a9-5be0-4304-821f-17eb8bf9e0b3	Derya Deniz	User	Pazarlama	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	\N	\N
6abacae4-4451-475a-8ffe-c8f139da5e88	Ramazan Detseli	Admin	Ar-Ge	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	ramazan@ktun.edu.tr	123456
d6432b14-4628-4bfb-9fc0-720c63c5ad6b	Ece Su	Manager	IT	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	manager@gmail.com	123
a9bc9402-9d4c-452e-85e5-c5ad14905811	Murat Yıldız	User	Lojistik	2026-07-18 16:43:50.80408	d6432b14-4628-4bfb-9fc0-720c63c5ad6b	murat@gmail.com	123
\.


--
-- TOC entry 4869 (class 0 OID 0)
-- Dependencies: 218
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_id_seq', 96, true);


--
-- TOC entry 4870 (class 0 OID 0)
-- Dependencies: 220
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 3, true);


--
-- TOC entry 4871 (class 0 OID 0)
-- Dependencies: 222
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 3, true);


--
-- TOC entry 4872 (class 0 OID 0)
-- Dependencies: 224
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.locations_id_seq', 6, true);


--
-- TOC entry 4873 (class 0 OID 0)
-- Dependencies: 226
-- Name: overtime_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.overtime_records_id_seq', 5, true);


--
-- TOC entry 4684 (class 2606 OID 16489)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 4687 (class 2606 OID 16491)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4690 (class 2606 OID 16493)
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4692 (class 2606 OID 16495)
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- TOC entry 4694 (class 2606 OID 16497)
-- Name: overtime_records overtime_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records
    ADD CONSTRAINT overtime_records_pkey PRIMARY KEY (id);


--
-- TOC entry 4696 (class 2606 OID 16499)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4685 (class 1259 OID 16500)
-- Name: idx_attendance_check_in; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_check_in ON public.attendance USING btree (check_in_time);


--
-- TOC entry 4688 (class 1259 OID 16501)
-- Name: idx_leave_start_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_start_date ON public.leave_requests USING btree (start_date);


--
-- TOC entry 4702 (class 2620 OID 16502)
-- Name: leave_requests trg_audit_leave; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_leave AFTER DELETE OR UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


--
-- TOC entry 4701 (class 2620 OID 16503)
-- Name: attendance trg_calc_duration; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_calc_duration BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.fn_calc_duration();


--
-- TOC entry 4697 (class 2606 OID 16504)
-- Name: attendance fk_attendance_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_location FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- TOC entry 4698 (class 2606 OID 16509)
-- Name: attendance fk_attendance_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- TOC entry 4699 (class 2606 OID 16514)
-- Name: leave_requests fk_leave_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- TOC entry 4700 (class 2606 OID 16519)
-- Name: overtime_records fk_overtime_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records
    ADD CONSTRAINT fk_overtime_user FOREIGN KEY (user_id) REFERENCES public.profiles(id);


-- Completed on 2026-07-20 01:42:41

--
-- PostgreSQL database dump complete
--

