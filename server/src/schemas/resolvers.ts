// import { AuthenticationError } from 'apollo-server-errors'; 
import User from '../models/User.js';
import { signToken, AuthenticationError  } from '../utils/auth.js';
interface UserContext {
  _id: string;
  username: string;
  email: string;
}

interface Context {
  user?: UserContext;
}

const resolvers = {
  Query: {
    getSingleUser: async (_parent: any, _args: any, context: Context) => {
      if (context.user) {
        return User.findById(context.user._id);
      }
      throw new AuthenticationError('Not logged in');
    },
  },
  Mutation: {
    login: async (_parent: any, { email, password }: { email: string, password: string }) => {
      const user:any = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Wrong password!');
      }

      const token = signToken( user.username, user.email, user._id.toString() );
      return { token, user };
    },
    addUser: async (_parent: any, { username, email, password }: { username: string, email: string, password: string }) => {
      const user:any = await User.create({ username, email, password });
      const token = signToken( user.username, user.email, user._id.toString() );
      return { token, user };
    },
    saveBook: async (_parent: any, { bookData }: { bookData: any }, context: Context) => {
      console.log("Save",context.user,bookData)
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );
console.log(updatedUser);

        return updatedUser;
      } catch (err) {
        console.error(err);
        throw new Error('Failed to save book');
      }
    },
    deleteBook: async (_parent: any, { bookData }: { bookData: any }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      } catch (err) {
        console.error(err);
        throw new Error('Failed to delete book');
      }
    },

    // deleteBook: async (_parent: any, { bookID }: deleteBookArgs, context: any) => {
//   if (context.user) {
//     return User.findOneAndUpdate(
//       { _id: userId },
//       {
//         $pull: { savedBooks: {_id: bookId } } },
//       { new: true }
//     );
//   }
//   throw AuthenticationError;
// },
  },
};

export default resolvers;

