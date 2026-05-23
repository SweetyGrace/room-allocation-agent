import * as yup from "yup";

export const schema = yup.object().shape({
  name: yup.string().required("Option is required"),
  type: yup.string().required("Type is required"),
  category: yup.string().required("Category is required"),
  otherCategory: yup
    .string()
    .test("category", "Other category is required", function (value) {
      const category = this.parent.category;
      return category === "Other" ? !!value : true;
    }),
});
