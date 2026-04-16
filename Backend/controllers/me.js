
import { asyncHandler } from "../utils/asynchandler.js";
import ApiResponse from "../utils/ApiResponse.js";
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(
      new ApiResponse(
        200,
        { user: req.user },
        "User fetched successfully"
      )
    );
  })
export default getMe;