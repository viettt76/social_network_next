import { PostManagementType } from '@/app/dataType';
import { Button } from '@/components/ui/button';
import PostManagementBase from './PostMangementBase';

export default function PostManagement({
    postInfo,
    handleApprovePost,
    handleRejectPost,
}: {
    postInfo: PostManagementType;
    handleApprovePost: (postId: string) => void;
    handleRejectPost?: (postId: string) => void;
}) {
    return (
        <div className="bg-background rounded-xl px-2 py-2 mb-4">
            <PostManagementBase postInfo={postInfo} />
            <div className="flex gap-x-4 mt-6 pt-2 border-t">
                {handleRejectPost && (
                    <Button className="flex-1" variant="destructive" onClick={() => handleRejectPost(postInfo.postId)}>
                        Từ chối
                    </Button>
                )}
                <Button className="flex-1" onClick={() => handleApprovePost(postInfo.postId)}>
                    Phê duyệt
                </Button>
            </div>
        </div>
    );
}
