import React from "react";
import Card from 'react-bootstrap/Card';
import Row from "react-bootstrap/Row";
import Col from 'react-bootstrap/Col';
import Masonry from 'react-masonry-css';
import '../components/BookList.css';
import BookDetails from "./BookDetails";
const BookList = () => {
    const books = [
        { id: 1, title: "Ky nghe lay tay" },
        { id: 2, title: "Ky nghe lay tay" },
        { id: 3, title: "Ky nghe lay tay" },
        { id: 4, title: "Ky nghe lay tay" },
        { id: 5, title: "Ky nghe lay tay" },
        { id: 6, title: "Ky nghe lay tay" },
    ];
    const breakpointColumnsObj = {
        default: 3,
        992: 2,
        576: 1
    };

    return (
        <Row>
            <Col xs={8}>
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {books.map((book) => (
                        <Card key={book.id} border="info" text="info" className="text-center shadow" style={{ marginBottom: '20px' }}>
                            <Card.Body>{book.title}</Card.Body>
                        </Card>
                    ))}
                </Masonry>
            </Col>
            <Col>
                <BookDetails />
            </Col>
        </Row>
    );
}

export default BookList;