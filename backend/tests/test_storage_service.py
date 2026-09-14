from app.services import storage_service


class _Paginator:
    def paginate(self, **kwargs):
        assert kwargs == {"Bucket": "documents", "Prefix": "users/user-123/"}
        return [
            {"Contents": [{"Key": "users/user-123/a.pdf"}, {"Key": "users/user-123/b.png"}]},
            {},
        ]


class _S3:
    def __init__(self):
        self.deleted = []

    def get_paginator(self, operation):
        assert operation == "list_objects_v2"
        return _Paginator()

    def delete_objects(self, **kwargs):
        self.deleted.append(kwargs)


def test_delete_user_files_removes_entire_prefix(monkeypatch):
    s3 = _S3()
    monkeypatch.setattr(storage_service, "get_s3_client", lambda: s3)

    deleted = storage_service.delete_user_files("user-123")

    assert deleted == 2
    assert s3.deleted == [{
        "Bucket": "documents",
        "Delete": {
            "Objects": [
                {"Key": "users/user-123/a.pdf"},
                {"Key": "users/user-123/b.png"},
            ],
            "Quiet": True,
        },
    }]


def test_delete_user_files_handles_empty_prefix(monkeypatch):
    class EmptyPaginator:
        def paginate(self, **kwargs):
            return [{}]

    class EmptyS3:
        def get_paginator(self, operation):
            return EmptyPaginator()

        def delete_objects(self, **kwargs):
            raise AssertionError("delete_objects should not be called")

    monkeypatch.setattr(storage_service, "get_s3_client", lambda: EmptyS3())
    assert storage_service.delete_user_files("nobody") == 0
