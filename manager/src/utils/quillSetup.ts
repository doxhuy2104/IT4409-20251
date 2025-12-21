import QuillResizeImage from "quill-resize-image";
import Quill from "quill";

// Đăng ký module resize image
if (!Quill.imports["modules/resize"]) {
    Quill.register("modules/resize", QuillResizeImage);
}

export default Quill;

