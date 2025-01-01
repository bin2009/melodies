import { fetchApiData } from "@/app/api/appService";
import { useAppContext } from "@/app/AppProvider";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ReportContentProps {
    cmtId?: string;
    onClose: () => void;
}

const ReportContent: React.FC<ReportContentProps> = ({ onClose, cmtId }) => {
    const { accessToken } = useAppContext();
    const { toast } = useToast()
    const reportContents = ['Toxic', 'Severe Toxic', 'Obscene', 'Threat', 'Insult', 'Identity Hate']
    const [selectedStates, setSelectedStates] = useState<any[]>(Array(reportContents.length).fill(0));
    const [textareaContent, setTextareaContent] = useState('');
    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };
    const handleCheckboxChange = (index: number) => {
        setSelectedStates((prevStates) =>
            prevStates.map((state, idx) => (idx === index ? 1 - state : state))
        );
    };

    const handleSubmit = async () => {
        const finalReportContents = [...selectedStates];
        if (textareaContent.trim()) {
            finalReportContents.push(textareaContent.trim());
        }
        console.log('Final Report Contents:', finalReportContents.join(','));

        const payload = {
            commentId: cmtId,
            content: finalReportContents.join(',')
        }
        if (accessToken) {
            const response = await fetchApiData('/api/user/actions/report', 'POST', JSON.stringify(payload), accessToken)
            if (response.success) {
                toast({
                    variant: "success",
                    title: "Your report is submitted.",
                    description: 'You have successfully reported your comment',
                    action: <ToastAction altText="Try again">Try again</ToastAction>,
                });
                onClose()
            }
        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: 'You must be logged in to perform this function',
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
            onClose()
        }
    };
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 shadow-md  z-50"
            onClick={handleBackgroundClick}
        >
            <div
                className='bg-[#1F1F1F] w-[30%] rounded-lg p-5 shadow-md border-2'
            >
                <h2 className="font-bold text-center mb-5 text-2xl text-primaryColorPink">REPORT CONTENT</h2>
                <div className='grid grid-cols-2 gap-5 gap-x-16 mb-5'>
                    {
                        reportContents.map((content, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="contentCheck"
                                    id={`contentCheck${index}`}
                                    checked={selectedStates[index] === 1}
                                    onChange={() => handleCheckboxChange(index)}
                                />
                                <label htmlFor={`contentCheck${index}`}>{content}</label>
                            </div>
                        ))
                    }
                </div>
                <div className="w-full mb-4">
                    <textarea
                        className="w-full h-[100px] outline-none p-2 rounded-md  text-black"
                        name=""
                        id=""
                        placeholder='Report Content...'
                        value={textareaContent}
                        onChange={(e) => setTextareaContent(e.target.value)}
                    ></textarea>
                </div>
                <div className="flex justify-center gap-x-8">
                    <button
                        onClick={() => {
                            onClose();
                        }}
                        className="px-8 py-2 font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-2 bg-primaryColorPink text-black rounded-xl font-semibold"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReportContent