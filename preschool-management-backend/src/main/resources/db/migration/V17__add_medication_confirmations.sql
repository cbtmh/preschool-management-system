CREATE TABLE medication_confirmations (
    request_id BIGINT NOT NULL REFERENCES medication_requests(id) ON DELETE CASCADE,
    confirmed_date DATE NOT NULL,
    PRIMARY KEY (request_id, confirmed_date)
);
