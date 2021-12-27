--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1 (Debian 14.1-1.pgdg110+1)
-- Dumped by pg_dump version 14.1 (Debian 14.1-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ltree; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS ltree WITH SCHEMA public;


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: comment_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.comment_mode AS ENUM (
    'discover',
    'following-only'
);


--
-- Name: comment_reply_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.comment_reply_mode AS ENUM (
    'basic',
    'quick'
);


--
-- Name: group_commenting_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.group_commenting_mode AS ENUM (
    'anyone-that-can-view',
    'only-flagged-members'
);


--
-- Name: group_posting_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.group_posting_mode AS ENUM (
    'anyone-that-can-view',
    'only-flagged-members'
);


--
-- Name: group_viewing_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.group_viewing_mode AS ENUM (
    'anyone',
    'members-only'
);


--
-- Name: post_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.post_mode AS ENUM (
    'discover',
    'following-only'
);


--
-- Name: f_comment_spam_vote(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.f_comment_spam_vote() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  update comment set num_spam_votes = num_spam_votes + 1 where comment_id = new.comment_id;
  return null;
END; $$;


--
-- Name: f_post_comment(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.f_post_comment() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  update post set last_comment = new.created_on where post_id = new.post_id;
  return null;
END; $$;


--
-- Name: f_post_spam_vote(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.f_post_spam_vote() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  update post set num_spam_votes = num_spam_votes + 1 where post_id = new.post_id;
  return null;
END; $$;


--
-- Name: f_post_tag(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.f_post_tag() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  update tag set num_posts = num_posts + 1 where tag_id = new.tag_id;
  return null;
END; $$;


--
-- Name: f_post_tag_del(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.f_post_tag_del() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  update tag set num_posts = num_posts - 1 where tag_id = old.tag_id;
  return null;
END; $$;


SET default_table_access_method = heap;

--
-- Name: domainname; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.domainname (
    domain_name_id integer NOT NULL,
    domain_name character varying(256)
);


--
-- Name: domainname_domain_name_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.domainname_domain_name_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: domainname_domain_name_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.domainname_domain_name_id_seq OWNED BY public.domainname.domain_name_id;


--
-- Name: follower; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.follower (
    follower_id integer NOT NULL,
    user_id integer NOT NULL,
    followee_user_id integer NOT NULL
);


--
-- Name: follower_follower_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.follower_follower_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: follower_follower_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.follower_follower_id_seq OWNED BY public.follower.follower_id;


--
-- Name: group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group (
    group_id integer NOT NULL,
    created_by integer NOT NULL,
    owned_by integer NOT NULL,
    name character varying(36) NOT NULL,
    group_viewing_mode public.group_viewing_mode DEFAULT 'anyone'::public.group_viewing_mode NOT NULL,
    group_posting_mode public.group_posting_mode DEFAULT 'anyone-that-can-view'::public.group_posting_mode NOT NULL,
    group_commenting_mode public.group_commenting_mode DEFAULT 'anyone-that-can-view'::public.group_commenting_mode NOT NULL
);


--
-- Name: group_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_group_id_seq OWNED BY public.group.group_id;


--
-- Name: groupmember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groupmember (
    group_member_id integer NOT NULL,
    private_group_id integer NOT NULL,
    user_id integer NOT NULL,
    created_on timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: groupmember_group_member_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.groupmember_group_member_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groupmember_group_member_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.groupmember_group_member_id_seq OWNED BY public.groupmember.group_member_id;


--
-- Name: member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member (
    member_id integer NOT NULL,
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    is_moderator boolean DEFAULT false NOT NULL,
    is_poster boolean DEFAULT false NOT NULL,
    is_commenter boolean DEFAULT false NOT NULL
);


--
-- Name: member_member_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_member_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_member_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_member_id_seq OWNED BY public.member.member_id;


--
-- Name: post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post (
    post_id integer NOT NULL,
    public_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id integer NOT NULL,
    title character varying(160) NOT NULL,
    text_content text,
    created_on timestamp with time zone DEFAULT now() NOT NULL,
    is_removed boolean DEFAULT false NOT NULL,
    link character varying(400) DEFAULT NULL::character varying,
    num_comments integer DEFAULT 0,
    num_spam_votes integer DEFAULT 0,
    removed_on timestamp with time zone,
    domain_name_id integer,
    last_comment timestamp with time zone
);


--
-- Name: post_post_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.post_post_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: post_post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.post_post_id_seq OWNED BY public.post.post_id;


--
-- Name: posttag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posttag (
    posttag_id integer NOT NULL,
    tag_id integer NOT NULL,
    post_id integer NOT NULL
);


--
-- Name: posttag_posttag_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.posttag_posttag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: posttag_posttag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.posttag_posttag_id_seq OWNED BY public.posttag.posttag_id;


--
-- Name: privategroup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.privategroup (
    private_group_id integer NOT NULL,
    created_by integer NOT NULL,
    name character varying(32) NOT NULL,
    created_on timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: privategroup_private_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.privategroup_private_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: privategroup_private_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.privategroup_private_group_id_seq OWNED BY public.privategroup.private_group_id;


--
-- Name: spamcomment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spamcomment (
    spamcomment_id integer NOT NULL,
    comment_id integer NOT NULL,
    user_id integer NOT NULL,
    created_on timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: spamcomment_spamcomment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.spamcomment_spamcomment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: spamcomment_spamcomment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.spamcomment_spamcomment_id_seq OWNED BY public.spamcomment.spamcomment_id;


--
-- Name: spampost; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spampost (
    spampost_id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    created_on timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: spampost_spampost_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.spampost_spampost_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: spampost_spampost_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.spampost_spampost_id_seq OWNED BY public.spampost.spampost_id;


--
-- Name: tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag (
    tag_id integer NOT NULL,
    tag character varying(32) NOT NULL,
    num_posts integer DEFAULT 0 NOT NULL,
    is_removed boolean DEFAULT false NOT NULL
);


--
-- Name: tag_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tag_tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tag_tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tag_tag_id_seq OWNED BY public.tag.tag_id;


--
-- Name: comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment (
    comment_id integer NOT NULL,
    public_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    text_content text NOT NULL,
    created_on timestamp with time zone DEFAULT now() NOT NULL,
    path public.ltree,
    is_removed boolean DEFAULT false NOT NULL,
    num_spam_votes integer DEFAULT 0,
    removed_on timestamp with time zone
);


--
-- Name: comment_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comment_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comment_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comment_comment_id_seq OWNED BY public.comment.comment_id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user (
    user_id integer NOT NULL,
    username character varying(32) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(255),
    time_zone character varying(64) DEFAULT 'UTC'::character varying NOT NULL,
    post_mode public.post_mode DEFAULT 'discover'::public.post_mode NOT NULL,
    comment_mode public.comment_mode DEFAULT 'discover'::public.comment_mode NOT NULL,
    is_eyes boolean DEFAULT false NOT NULL,
    eyes integer,
    comment_reply_mode public.comment_reply_mode DEFAULT 'quick'::public.comment_reply_mode NOT NULL,
    site_width smallint DEFAULT 600,
    public_id uuid DEFAULT public.uuid_generate_v4() NOT NULL
);


--
-- Name: user_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_user_id_seq OWNED BY public.user.user_id;


--
-- Name: domainname domain_name_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domainname ALTER COLUMN domain_name_id SET DEFAULT nextval('public.domainname_domain_name_id_seq'::regclass);


--
-- Name: follower follower_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follower ALTER COLUMN follower_id SET DEFAULT nextval('public.follower_follower_id_seq'::regclass);


--
-- Name: group group_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group ALTER COLUMN group_id SET DEFAULT nextval('public.group_group_id_seq'::regclass);


--
-- Name: groupmember group_member_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groupmember ALTER COLUMN group_member_id SET DEFAULT nextval('public.groupmember_group_member_id_seq'::regclass);


--
-- Name: member member_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member ALTER COLUMN member_id SET DEFAULT nextval('public.member_member_id_seq'::regclass);


--
-- Name: post post_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post ALTER COLUMN post_id SET DEFAULT nextval('public.post_post_id_seq'::regclass);


--
-- Name: posttag posttag_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posttag ALTER COLUMN posttag_id SET DEFAULT nextval('public.posttag_posttag_id_seq'::regclass);


--
-- Name: privategroup private_group_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privategroup ALTER COLUMN private_group_id SET DEFAULT nextval('public.privategroup_private_group_id_seq'::regclass);


--
-- Name: spamcomment spamcomment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spamcomment ALTER COLUMN spamcomment_id SET DEFAULT nextval('public.spamcomment_spamcomment_id_seq'::regclass);


--
-- Name: spampost spampost_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spampost ALTER COLUMN spampost_id SET DEFAULT nextval('public.spampost_spampost_id_seq'::regclass);


--
-- Name: tag tag_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag ALTER COLUMN tag_id SET DEFAULT nextval('public.tag_tag_id_seq'::regclass);


--
-- Name: comment comment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment ALTER COLUMN comment_id SET DEFAULT nextval('public.comment_comment_id_seq'::regclass);


--
-- Name: user user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user ALTER COLUMN user_id SET DEFAULT nextval('public.user_user_id_seq'::regclass);


--
-- Name: domainname domainname_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domainname
    ADD CONSTRAINT domainname_pkey PRIMARY KEY (domain_name_id);


--
-- Name: follower follower_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follower
    ADD CONSTRAINT follower_pkey PRIMARY KEY (follower_id);


--
-- Name: group group_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group
    ADD CONSTRAINT group_name_key UNIQUE (name);


--
-- Name: group group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group
    ADD CONSTRAINT group_pkey PRIMARY KEY (group_id);


--
-- Name: groupmember groupmember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groupmember
    ADD CONSTRAINT groupmember_pkey PRIMARY KEY (group_member_id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (member_id);


--
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (post_id);


--
-- Name: posttag posttag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posttag
    ADD CONSTRAINT posttag_pkey PRIMARY KEY (posttag_id);


--
-- Name: privategroup privategroup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privategroup
    ADD CONSTRAINT privategroup_pkey PRIMARY KEY (private_group_id);


--
-- Name: spamcomment spamcomment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spamcomment
    ADD CONSTRAINT spamcomment_pkey PRIMARY KEY (spamcomment_id);


--
-- Name: spampost spampost_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spampost
    ADD CONSTRAINT spampost_pkey PRIMARY KEY (spampost_id);


--
-- Name: tag tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (tag_id);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (comment_id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user
    ADD CONSTRAINT user_pkey PRIMARY KEY (user_id);


--
-- Name: path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX path_idx ON public.comment USING gist (path);


--
-- Name: username_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX username_unique_idx ON public.user USING btree (lower((username)::text));


--
-- Name: spamcomment comment_spam_vote; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER comment_spam_vote AFTER INSERT ON public.spamcomment FOR EACH ROW EXECUTE FUNCTION public.f_comment_spam_vote();


--
-- Name: comment post_comment; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER post_comment AFTER INSERT ON public.comment FOR EACH ROW EXECUTE FUNCTION public.f_post_comment();


--
-- Name: spampost post_spam_vote; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER post_spam_vote AFTER INSERT ON public.spampost FOR EACH ROW EXECUTE FUNCTION public.f_post_spam_vote();


--
-- Name: posttag post_tag; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER post_tag AFTER INSERT ON public.posttag FOR EACH ROW EXECUTE FUNCTION public.f_post_tag();


--
-- Name: posttag post_tag_del; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER post_tag_del AFTER DELETE ON public.posttag FOR EACH ROW EXECUTE FUNCTION public.f_post_tag_del();


--
-- PostgreSQL database dump complete
--
