--
-- PostgreSQL database dump
--

\restrict 78OogfTm7fcQYRZ1Wyja6r5mVnvMcdFTbbCVop3yBwHx15Iv02qGiKE0YgSbgdP

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-07-13 14:11:46

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

--
-- TOC entry 231 (class 1255 OID 24592)
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
-- TOC entry 230 (class 1255 OID 24590)
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
-- TOC entry 232 (class 1255 OID 24594)
-- Name: handle_attendance(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_attendance(p_user_id uuid, p_location_id integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_active_id INT;
BEGIN
    -- Kullan\u0131c\u0131n\u0131n \u015fu an içeride aktif ('Active') bir kayd\u0131 var m\u0131 kontrol et
    SELECT id INTO v_active_id 
    FROM attendance 
    WHERE user_id = p_user_id AND status = 'Active'
    LIMIT 1;

    -- E\u011fer aktif kay\u0131t VARSA -> ÇIKI\u015e (UPDATE) YAP
    IF v_active_id IS NOT NULL THEN
        UPDATE attendance 
        SET 
            check_out_time = CURRENT_TIMESTAMP,
            status = 'Completed'
        WHERE id = v_active_id;
        
        RETURN 'Ç\u0131k\u0131\u015f Yap\u0131ld\u0131 (Check-out Success)';
        
    -- E\u011fer aktif kay\u0131t YOKSA -> G\u0130R\u0130\u015e (INSERT) YAP
    ELSE
        INSERT INTO attendance (user_id, location_id, check_in_time, status)
        VALUES (p_user_id, p_location_id, CURRENT_TIMESTAMP, 'Active');
        
        RETURN 'Giri\u015f Yap\u0131ld\u0131 (Check-in Success)';
    END IF;
END;
$$;


ALTER FUNCTION public.handle_attendance(p_user_id uuid, p_location_id integer) OWNER TO postgres;

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
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 222
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- TOC entry 229 (class 1259 OID 24577)
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
-- TOC entry 228 (class 1259 OID 24576)
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
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 228
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


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
-- TOC entry 5083 (class 0 OID 0)
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
-- TOC entry 5084 (class 0 OID 0)
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
-- TOC entry 5085 (class 0 OID 0)
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
-- TOC entry 4887 (class 2604 OID 16418)
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 24580)
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 16444)
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- TOC entry 4885 (class 2604 OID 16405)
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 16466)
-- Name: overtime_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records ALTER COLUMN id SET DEFAULT nextval('public.overtime_records_id_seq'::regclass);


--
-- TOC entry 5069 (class 0 OID 16415)
-- Dependencies: 223
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, user_id, location_id, check_in_time, check_out_time, status, duration) FROM stdin;
1	74ba19df-7592-491b-90f7-123e456789ab	1	2026-07-08 08:00:00	2026-07-08 17:00:00	Completed	540
2	74ba19df-7592-491b-90f7-123e456789ab	1	2026-07-08 08:00:00	2026-07-08 17:00:00	Completed	540
3	74ba19df-7592-491b-90f7-123e456789ab	1	2026-07-13 13:57:36.046498	2026-07-13 13:57:52.982337	Completed	0
\.


--
-- TOC entry 5075 (class 0 OID 24577)
-- Dependencies: 229
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, table_name, operation, old_data, new_data, changed_by, changed_at) FROM stdin;
\.


--
-- TOC entry 5071 (class 0 OID 16441)
-- Dependencies: 225
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_requests (id, user_id, leave_type, start_date, end_date, status, created_at) FROM stdin;
\.


--
-- TOC entry 5067 (class 0 OID 16402)
-- Dependencies: 221
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, location_name, qr_code_secret, latitude, longitude, created_at) FROM stdin;
1	Merkez Bina Ana Giri\\u015f	gizli_merkez_kapisi_shf123	37.8749000	32.4932000	2026-07-08 11:45:59.230084
\.


--
-- TOC entry 5073 (class 0 OID 16463)
-- Dependencies: 227
-- Data for Name: overtime_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.overtime_records (id, user_id, record_date, hours_worked, description, created_at) FROM stdin;
\.


--
-- TOC entry 5065 (class 0 OID 16389)
-- Dependencies: 219
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, full_name, role, department, created_at) FROM stdin;
74ba19df-7592-491b-90f7-123e456789ab	Ahmet Y\\u0131lmaz	Personel	Bilgi \\u0130\\u015flem	2026-07-08 11:45:59.230084
\.


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 222
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_id_seq', 3, true);


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 228
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 224
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 1, false);


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 220
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.locations_id_seq', 1, true);


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 226
-- Name: overtime_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.overtime_records_id_seq', 1, false);


--
-- TOC entry 4903 (class 2606 OID 16429)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 4911 (class 2606 OID 24589)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4907 (class 2606 OID 16456)
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4901 (class 2606 OID 16413)
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- TOC entry 4909 (class 2606 OID 16475)
-- Name: overtime_records overtime_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records
    ADD CONSTRAINT overtime_records_pkey PRIMARY KEY (id);


--
-- TOC entry 4899 (class 2606 OID 16400)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4904 (class 1259 OID 16481)
-- Name: idx_attendance_check_in; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_check_in ON public.attendance USING btree (check_in_time);


--
-- TOC entry 4905 (class 1259 OID 16482)
-- Name: idx_leave_start_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_start_date ON public.leave_requests USING btree (start_date);


--
-- TOC entry 4917 (class 2620 OID 24593)
-- Name: leave_requests trg_audit_leave; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_leave AFTER DELETE OR UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


--
-- TOC entry 4916 (class 2620 OID 24591)
-- Name: attendance trg_calc_duration; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_calc_duration BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.fn_calc_duration();


--
-- TOC entry 4912 (class 2606 OID 16435)
-- Name: attendance fk_attendance_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_location FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- TOC entry 4913 (class 2606 OID 16430)
-- Name: attendance fk_attendance_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- TOC entry 4914 (class 2606 OID 16457)
-- Name: leave_requests fk_leave_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- TOC entry 4915 (class 2606 OID 16476)
-- Name: overtime_records fk_overtime_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records
    ADD CONSTRAINT fk_overtime_user FOREIGN KEY (user_id) REFERENCES public.profiles(id);


-- Completed on 2026-07-13 14:11:46

--
-- PostgreSQL database dump complete
--

\unrestrict 78OogfTm7fcQYRZ1Wyja6r5mVnvMcdFTbbCVop3yBwHx15Iv02qGiKE0YgSbgdP

