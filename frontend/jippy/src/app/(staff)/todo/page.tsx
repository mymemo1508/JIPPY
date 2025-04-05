'use client';

import PageTitle from "@/features/common/components/layout/title/PageTitle";
import { useEffect, useState } from "react";
import {
    Todo,
    TodoItemProps
} from "@/features/todo/types/todo";
import { useSwipeable } from 'react-swipeable';
import { ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Trash2, Check } from "lucide-react";

const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
};

const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
    const [isSwipeOpen, setIsSwipeOpen] = useState(false);

    const handlers = useSwipeable({
        onSwipedLeft: () => setIsSwipeOpen(true),
        onSwipedRight: () => setIsSwipeOpen(false),
        preventScrollOnSwipe: true,
        trackMouse: true
    });

    const handleDeleteClick = () => {
        onDelete(todo.id);
    };

    return (
        <div className="relative overflow-hidden">
            <div
                {...handlers}
                className={`
                    bg-white border-b last:border-b-0
                    cursor-pointer hover:bg-gray-50 
                    transition-all duration-300 ease-in-out
                    ${isSwipeOpen ? '-translate-x-[60px]' : 'translate-x-0'}
                `}
            >
                <div className="py-3">
                    <div className="flex justify-between items-center px-6">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={todo.complete}
                                onChange={() => onToggle(todo.id)}
                                className="h-4 w-4 accent-[#ff5c00]"
                            />
                            <span className={`font-medium ${todo.complete ? 'line-through text-gray-400' : ''}`}>
                                {todo.title}
                            </span>
                        </div>
                        <span className="text-sm text-gray-600">
                            {todo.createdAt.split(' ')[0]}
                        </span>
                    </div>
                </div>
            </div>

            <div
                className={`
                    absolute right-0 top-0 bottom-0 
                    flex items-center 
                    bg-white
                    w-[60px] 
                    transition-all duration-300
                    border-l
                    ${isSwipeOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
                `}
            >
                <button
                    onClick={handleDeleteClick}
                    className="w-full h-full flex items-center justify-center hover:bg-gray-50"
                    aria-label="삭제"
                >
                    <Trash2 className="text-red-500" size={22} />
                </button>
            </div>
        </div>
    );
};


const TodoPage = () => {
    const router = useRouter();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInput, setShowInput] = useState(false);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [showScrollTop, setShowScrollTop] = useState(true);

    const scrollToTop = () => {
        const element = document.getElementById('page-top');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleDelete = async (todoId: number) => {
        try {
            const encodedStoreIdList = getCookieValue('storeIdList');
            const userId = getCookieValue('userId');

            if (!encodedStoreIdList || !userId) {
                
                router.push("/login");
                return;
            }

            const decodedStoreIdList = decodeURIComponent(encodedStoreIdList);
            const storeIdList = JSON.parse(decodedStoreIdList);
            const storeId = storeIdList[0];

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todo/${storeId}/delete/${todoId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('할 일 삭제에 실패했습니다');
            }

            setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
        } catch (error: unknown) {
            console.error('할 일 삭제 실패 : ', error);
            alert('할 일 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    }

    const fetchTodos = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const encodedStoreIdList = getCookieValue('storeIdList');
            const userId = getCookieValue('userId');

            if (!encodedStoreIdList || !userId) {
                router.push("/login");
                return;
            }

            const decodedStoreIdList = decodeURIComponent(encodedStoreIdList);
            const storeIdList = JSON.parse(decodedStoreIdList);
            const storeId = storeIdList[0];

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todo/${storeId}/select`);

            if (!response.ok) {
                throw new Error('할 일 목록을 불러오는데 실패했습니다');
            }

            const data = await response.json();

            const sortedTodos = data.sort((a: Todo, b: Todo) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setTodos(sortedTodos);
        } catch (error: unknown) {
            console.error('할 일 목록 로딩 실패:', error);
            setError('할 일 목록을 불러오는데 실패 했습니다');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();

        const handleScroll = () => {
            if (typeof window !== 'undefined') {
                const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                setShowScrollTop(scrollY > 200);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const handleToggle = async (todoId: number) => {
        try {
            const encodedStoreIdList = getCookieValue('storeIdList');
            const userId = getCookieValue('userId');

            if (!encodedStoreIdList || !userId) {
                router.push("/login");
                return;
            }

            const decodedStoreIdList = decodeURIComponent(encodedStoreIdList);
            const storeIdList = JSON.parse(decodedStoreIdList);
            const storeId = storeIdList[0];

            const todoToUpdate = todos.find(todo => todo.id === todoId);

            if (!todoToUpdate) return;

            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === todoId ? { ...todo, complete: !todo.complete } : todo
                )
            );

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todo/${storeId}/update/${todoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: todoToUpdate.title,
                    complete: !todoToUpdate.complete
                }),
            });

            if (!response.ok) {
                setTodos(prevTodos =>
                    prevTodos.map(todo =>
                        todo.id === todoId ? { ...todo, complete: todoToUpdate.complete } : todo
                    )
                );
                throw new Error('상태 업데이트에 실패했습니다');
            }
        } catch (error) {
            console.error('상태 업데이트 실패:', error);
            alert('상태 업데이트에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleAddTodo = async () => {
        if (!newTodoTitle.trim()) return;

        try {
            const encodedStoreIdList = getCookieValue('storeIdList');
            const userId = getCookieValue('userId');

            if (!encodedStoreIdList || !userId) {
                setError("다시 로그인해주세요");
                return;
            }

            const decodedStoreIdList = decodeURIComponent(encodedStoreIdList);
            const storeIdList = JSON.parse(decodedStoreIdList);
            const storeId = storeIdList[0];
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todo/${storeId}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newTodoTitle.trim(),
                    isComplete: false
                }),
            });

            if (!response.ok) {
                throw new Error('할 일 추가에 실패했습니다');
            }

            await fetchTodos();
            setNewTodoTitle('');
            setShowInput(false);
        } catch (error) {
            console.error('할 일 추가 실패:', error);
            alert('할 일 추가에 실패했습니다. 다시 시도해주세요.');
        }

    }

    if (isLoading) {
        return (
            <div>
                <PageTitle />
                <div className="p-4">
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col h-[360px] justify-center items-center">
                        <p>로딩 중...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <PageTitle />
                <div className="p-4">
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col h-[360px] justify-center items-center">
                        <p className="text-red-500">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageTitle />
            <div className="p-4">
                <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                    <div className="flex justify-between items-center pb-3">
                        <h1 className="text-[24px] font-bold text-black">📝 투두리스트</h1>
                        <button
                            onClick={() => setShowInput(!showInput)}
                            className="w-8 h-8 flex items-center justify-center text-[24px] text-[#ff5c00] font-bold rounded hover:bg-orange-50 transition-colors"
                        >
                            +
                        </button>
                    </div>

                    <div>
                        {showInput && (
                            <div className="mb-4 flex gap-2">
                                <input
                                    type="text"
                                    value={newTodoTitle}
                                    onChange={(e) => setNewTodoTitle(e.target.value)}
                                    placeholder="할 일을 입력하세요"
                                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-[#ff5c00]"
                                />
                                <button
                                    onClick={handleAddTodo}
                                    className="w-10 h-10 bg-[#ff5c00] text-white rounded flex items-center justify-center hover:bg-[#ff4400] transition-colors"
                                    aria-label="할 일 추가"
                                >
                                    <Check size={20}/>
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        {todos.length > 0 ? (
                            <>
                                <div className="scrollbar-custom overflow-y-auto flex-grow">
                                    {todos.map(todo => (
                                        <TodoItem
                                            key={todo.id}
                                            todo={todo}
                                            onToggle={handleToggle}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center">등록된 할 일이 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>
            <button
                onClick={scrollToTop}
                className={`fixed bottom-32 right-8 w-12 h-12 bg-[#ff5c00] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#ff7c33] transition-all ${showScrollTop ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                aria-label="맨 위로 스크롤"
            >
                <ChevronUp size={24} />
            </button>
        </>
    );
};

export default TodoPage;