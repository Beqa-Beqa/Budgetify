import "./category.css";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import { useContext, useState } from "react";
import AddCategoryPrompt from "../../../Containers/Home/AddCategoryPrompt/AddCategoryPrompt";
import ActionPrompt from "../ActionPrompt/ActionPrompt";
import { GeneralContext } from "../../../Contexts/GeneralContextProvider";
import { deleteCategory, updateCategoriesData } from "../../../Functions";
import { AuthContext } from "../../../Contexts/AuthContextProvider";

const Category = (props: {
  categoryData: CategoryData,
  onclick?: () => void
}) => {
  const data = props.categoryData;
  const iconSizes = {width: 20, height: 20};

  const {setShowToastMessage} = useContext(GeneralContext);
  const {categoriesData, setCategoriesData, transactionsData} = useContext(AuthContext);

  const [showEditPrompt, setShowEditPrompt] = useState<boolean>(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState<boolean>(false);

  const handleDelete = async () => {
    try {
      await deleteCategory({owner: props.categoryData.owner, categoryId: props.categoryData._id});
      
      updateCategoriesData(categoriesData, setCategoriesData, {new: props.categoryData, old: undefined}, "Delete");
      setShowDeletePrompt(false);
      setShowToastMessage({show: true, text: `Category ${data.title} is successfully removed`})
    } catch (err) {
      console.error(err);
    }
  }

  const isCategoryInUse = transactionsData.find((data: TransactionData) => data.chosenCategories.indexOf(props.categoryData._id) > -1);

  return (
    <>
      <div onClick={props.onclick && props.onclick} className={`position-relative d-flex gap-2 text-truncate align-items-center p-3 category ${data.transactionType === "Income" ? "income-type" : "expense-type"} rounded`}>
        <span className="category-title rounded fs-5 fw-bold">{data.title}</span>
        <span style={{left: 0, top: 0}} className="position-absolute rounded p-2 category-tooltip">{data.title}</span>
        <div className="d-flex gap-2 align-items-center">
          <div onClick={() => setShowEditPrompt(true)} role="button">
            <MdOutlineModeEdit style={iconSizes} />
          </div>
          <div onClick={() => setShowDeletePrompt(true)} role="button">
            <FaRegTrashCan style={iconSizes} />
          </div>
        </div>
      </div>
      <AddCategoryPrompt classname={showEditPrompt ? "show" : ""} setShowAddCategoryPrompt={setShowEditPrompt} data={props.categoryData} />
      {
        showDeletePrompt ?
          isCategoryInUse ?
            <ActionPrompt 
              text="This category can't be removed because it contains information about your expenses"
              cancel={{text: "Ok", action: () => {setShowDeletePrompt(false)}}}
            />
          :
            <ActionPrompt 
              text="Are you sure you want to delete this category?" 
              head="Delete Category"
              cancel={{text: "No", action: () => setShowDeletePrompt(false)}}
              confirm={{text: "Yes", action: handleDelete}}
            />
        : null
      }
    </>
  );
}

export default Category;