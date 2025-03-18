import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SINGLE_USER } from '../utils/queries';
import { DELETE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';


  interface Book {
    bookId: string;
    title: string;
    authors: string[];
    description: string;
    image: string;
    link: string;
  }
  
  interface UserData {
    me: {
      savedBooks: Book[];
    };
  }
  
  const SavedBooks: React.FC = () => {
    const { loading, data } = useQuery<UserData>(GET_SINGLE_USER);
    const [deleteBook] = useMutation(DELETE_BOOK);
  
    const userData = data?.getSingleUser || { savedBooks: [] };
  
    const handleDeleteBook = async (bookId: string) => {
      const token = Auth.loggedIn() ? Auth.getToken() : null;
  
      if (!token) {
        return false;
      }
  
      try {
        await deleteBook({
          variables: { bookId },
          update: (cache, { data: { deleteBook } }) => {
            const { getSingleUser } = cache.readQuery<UserData>({ query: GET_SINGLE_USER })!;
            cache.writeQuery({
              query: GET_SINGLE_USER,
              data: { getSingleUser: { ...getSingleUser, savedBooks: deleteBook.savedBooks } },
            });
          },
        });
  
        removeBookId(bookId);
      } catch (err) {
        console.error(err);
      }
    };
  
    if (loading) {
      return <h2>LOADING...</h2>;
    }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md='4' key={book.bookId}>
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
