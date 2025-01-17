/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Row, Col, Spinner } from "react-bootstrap";
import { useCallback, useEffect, useRef, useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import transactionTypeDictionary from "../../@core/utils/transaction-type-dictionary";
import ToastTCF from "../../@core/components/Toast";
import BaseActions from "../../@core/components/ui/Datatable/BaseActions";
import CardTCF from "../../@core/components/ui/Card";
import ModalTCF from "../../@core/components/ui/Modal";
import ButtonTCF from "../../@core/components/ui/Button";
import DatatableTCF from "../../@core/components/ui/Datatable";
import TransacaoForm from "../../@core/components/forms/Transacao";
import { signOut, useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";
import useAxiosAuth from "@/@core/hooks/useAxiosAuth";
import transactionsService from "@/@core/services/api-node/transactions.service";
import router from "next/router";
import useTransactionsService from "@/@core/services/api-node/transactions.service";
import ModalUploadTransacoes from "./modalUpload";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";

interface CustomJwtPayload {
  userId: string;
  iat: number;
  exp: number;
}


export default function Transacoes() {
  const [transactions, setTransactions] = useState<any>([]);
  const [rowId, setRowId] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("false");
  const itemClickedCurrent = useRef<any>();
  const [isModalTransacaoOpen, setIsModalTransacaoOpen] =
    useState<boolean>(false);
  const [typeTransaction, setTypeTransaction] = useState<string>("");
  const [valueToast, setShowToast] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [icon, setIcon] = useState<any>("");
  const [toastTitle, setToastTitle] = useState<string>("");
  const [dataToForm, setDataToForm] = useState<any>();
  const axiosHookHandler: any = useAxiosAuth();
  const [isModalUploadOpen, setIsModalUploadOpen] = useState(false);

  const { data: session } = useSession(); // os dados de sessão podem ser colocados no gerenciador de estados
  const { user } = useSelector((state: any) => state.user);

  const token = session?.user?.result?.token;
  let userId = "";

  if (token) {
    try {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      userId = decodedToken.userId;
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  } else {
    console.error("Token não encontrado na sessão.");
  }


  // @ts-ignore
  const TransacoesGraficos = dynamic<{ token: string; clientId: string }>(() => import('remoteNextApp/transacoesGrafico'), {
    ssr: false,
    loading: () => (
      <Row>
        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          className=" d-flex justify-content-center"
        >
          <Spinner
            animation="border"
            role="status"
            variant="secondary"
            size="sm"
          />
        </Col>
      </Row>
    ),
  });


  const handleDeleteClose = () => {
    setIsModalOpen(false);
  };

  const handleModalUploadOpen = () => {
    setIsModalUploadOpen(true);
  }
  const handleModalClose = () => {
    setIsModalUploadOpen(false);
  };

  const handleCloseDeleteSubmit = async () => {
    const criteriaToDelete: any = {
      id: itemClickedCurrent.current,
    };
    await transactionsService
      .deleteTransaction(axiosHookHandler, criteriaToDelete)
      .then(() => {
        fetchTransactions();
        setShowToast(true);
        setMessage("Transação Removida com Sucesso");
        setIcon("success");
        setToastTitle("Sucesso!");
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
        setLoading(true);
        setIsModalOpen(false);
      });
  };

  const handleTransacaoModal = async (
    type: string,
    state: boolean,
    value?: any
  ) => {
    const criteria: any = {
      id: value,
    };
    switch (type) {
      case "add":
        setModalTitle("Nova Transação");
        setIsModalTransacaoOpen(state);
        setTypeTransaction(type);
        break;
      case "edit":
        setModalTitle("Editar Transação");
        setTypeTransaction(type);
        await transactionsService
          .getTransactionById(axiosHookHandler, criteria)
          .then((res: any) => {
            setDataToForm(res.data);
            setIsModalTransacaoOpen(state);
          });
        break;
      case "view":
        setModalTitle("Visualizar Transação");
        setTypeTransaction(type);
        await transactionsService
          .getTransactionById(axiosHookHandler, criteria)
          .then((res: any) => {
            setDataToForm(res.data);
            setIsModalTransacaoOpen(state);
          });
        break;
      default:
        setIsModalTransacaoOpen(state);
        break;
    }
  };  

  const handleShowDelete = (itemClicked: any) => {
    setIsModalOpen(true);
    itemClickedCurrent.current = itemClicked;
  };

  const handleTransacaoForm = useCallback(
    async (e: Event, formData: any) => {
      e.preventDefault();
      if (user.token === "") return;
      const token: string = user.token;
      const decodedUser: any = jwtDecode(token);
      switch (typeTransaction) {
        case "add":
          const formattedFormDataAdd: any = {
            ...formData,
            userId: decodedUser.userId,
            description: "Transação Criada na Tela de Transações",
          };
          await transactionsService
            .createTransaction(axiosHookHandler, formattedFormDataAdd)
            .then(() => {
              fetchTransactions();
              setShowToast(true);
              setMessage("Transação Realizada com Sucesso");
              setIcon("success");
              setToastTitle("Sucesso!");
              setTimeout(() => {
                setShowToast(false);
              }, 3000);
            })
            .catch((error: any) => {
              setShowToast(true);
              setMessage(error.response.data.message);
              setIcon("error");
              setToastTitle("Erro!");
              setTimeout(() => {
                setShowToast(false);
              }, 3000);
              console.error(error.response.data.message);
            });

          // CÓDIGO DA FASE 1 - PARA CRITÉRIO DE COMPARAÇÃO
          // await createTransaction(formData)
          //   .then((res: any) => {
          //     const transacoesToTable = res;
          //     setTransactions(transacoesToTable);
          //     setShowToast(true);
          //     setMessage("Transação Realizada com Sucesso");
          //     setIcon("success");
          //     setToastTitle("Sucesso!");
          //     setTimeout(() => {
          //       setShowToast(false);
          //     }, 3000);
          //   })
          //   .catch((error: any) => {
          //     setShowToast(true);
          //     setMessage(error);
          //     setIcon("error");
          //     setToastTitle("Erro!");
          //     setTimeout(() => {
          //       setShowToast(false);
          //     }, 3000);
          //     console.error(error);
          //     setLoading(false);
          //   });
          setLoading(true);
          setIsModalTransacaoOpen(false);
          break;
        case "edit":
          const transactionId: any = { id: formData._id };
          const formattedFormDataEdit: any = {
            ...formData,
            userId: decodedUser.userId,
            description: "Transação Editada na Tela de Transações",
          };
          await transactionsService
            .updateTransaction(
              axiosHookHandler,
              formattedFormDataEdit,
              transactionId
            )
            .then(() => {
              fetchTransactions();
              setShowToast(true);
              setMessage("Transação Atualizada com Sucesso");
              setIcon("success");
              setToastTitle("Sucesso!");
              setTimeout(() => {
                setShowToast(false);
              }, 3000);
            })
            .catch((error: any) => {
              setShowToast(true);
              setMessage(error.response.data.message);
              setIcon("error");
              setToastTitle("Erro!");
              setTimeout(() => {
                setShowToast(false);
              }, 3000);
              console.error(error.response.data.message);
            });

          // CÓDIGO DA FASE 1 - PARA CRITÉRIO DE COMPARAÇÃO
          // await updateTransaction(dataToForm.id, formData)
          //   .then((res: any) => {
          //     const transacoesToTable = res;
          //     setTransactions(transacoesToTable);
          //     setShowToast(true);
          //     setMessage("Transação Modificada com Sucesso");
          //     setIcon("success");
          //     setToastTitle("Sucesso!");
          //     setTimeout(() => {
          //       setShowToast(false);
          //     }, 3000);
          //   })
          //   .catch((error: any) => {
          //     setShowToast(true);
          //     setMessage(error);
          //     setIcon("error");
          //     setToastTitle("Erro!");
          //     setTimeout(() => {
          //       setShowToast(false);
          //     }, 3000);
          //     console.error(error);
          //     setLoading(false);
          //   });

          setLoading(true);
          setIsModalTransacaoOpen(false);
          break;
        default:
          setLoading(true);
          setIsModalTransacaoOpen(false);
          break;
      }
    },
    [user]
  );

  const fetchTransactions = useCallback(async () => {
    if (user.token === "") return;
    setLoading(true);
    const token: string = user.token;
    const decodedUser: any = jwtDecode(token);

    try {
      await transactionsService
        .getTransactions(axiosHookHandler, {
          userId: decodedUser.userId,
        })
        .then((res: any) => {
          const options: any = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          };
          const transacoesToTable = res.data.result.map((item: any) => {
            return {
              ...item,
              amount:
                item.transactionType == "deposito"
                  ? item.amount
                  : item.amount * -1,
              transaction: transactionTypeDictionary.get(item.transactionType),
              date: new Date(item.date).toLocaleDateString("pt-br", options),
              id: item._id,
            };
          });
          setTransactions(transacoesToTable);
          setLoading(false);
        })
        .catch((error: any) => {
          if (error.response.status === 401) {
            setShowToast(true);
            setMessage(error.response.data.message);
            setIcon("error");
            setToastTitle("Erro!");
            setTimeout(() => {
              setShowToast(false);
            }, 3000);
            router.push("/");
            signOut({
              redirect: false,
            });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error: any) {
      console.error(error);
    }
  }, [user]);

   const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `files/modelo-transacao.csv`;
    link.download = 'modelo-transacao.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Ações",
      headerClassName: "datatable-tcf",
      type: "actions",
      renderCell: (params) => (
        <BaseActions
          editAction={handleTransacaoModal}
          viewAction={handleTransacaoModal}
          deleteAction={handleShowDelete}
          {...{ params, rowId, setRowId }}
        />
      ),
    },
    {
      field: "transaction",
      headerName: "Transação",
      headerClassName: "datatable-tcf",
      width: 130,
    },
    {
      field: "amount",
      headerName: "Quantia",
      headerClassName: "datatable-tcf",
      width: 130,
    },
    {
      field: "date",
      headerName: "Data",
      headerClassName: "datatable-tcf",
      width: 400,
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return (
    <>
      <ToastTCF
        icon={icon}
        message={message}
        title={toastTitle}
        showToast={valueToast}
      />
      <CardTCF
        title="Listagem de Transações"
        body={
          <ListagemComponent
            columns={columns}
            transactions={transactions}
            paginationModel={paginationModel}
            loading={loading}
            functionSubmit={handleTransacaoForm}
            functionHandleDownload={handleDownload}
            functionHandleModalOpen={handleModalUploadOpen}
            functionHandleModal={handleTransacaoModal}
            isModalOpen={isModalTransacaoOpen}
            modalTitle={modalTitle}
            typeTransaction={typeTransaction}
            dataToForm={dataToForm}
          />
        }
      />
      <ModalTCF
        title="Remover Transação"
        isOpen={isModalOpen}
        body={"Tem certeza que deseja remover essa transação?"}
        hasFooter={true}
        center={true}
        sizeModal="md"
        type="delete"
        onCloseAction={handleDeleteClose}
        onSubmitAction={handleCloseDeleteSubmit}
      />
      <CardTCF
        title="Resumo das Transações"
        body={
          <TransacoesGraficos token={token} clientId={userId} />
        }
      />
      <ModalUploadTransacoes
        isOpen={isModalUploadOpen}
        body={<p>Conteúdo do modal centralizado e responsivo</p>}
        center={true}
        type={'home-modal'}
        hasFooter={true}
        onCloseAction={handleModalClose}
        onSubmitAction={fetchTransactions}
      />
    </>
  );
}

export function ListagemComponent(props: any) {
  return (
    <>
      <Row>
        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          className="d-flex d-md-flex justify-content-end gap-3 mb-3"
        >
          <ButtonTCF
            variant={"primary"}
            label={"Baixar Template"}
            disabled={false}
            size={"sm"}
            onClick={() =>props.functionHandleDownload()}
          />

          <ButtonTCF
            variant="green"
            label="Transações em Lote"
            disabled={false}
            size="sm"
            onClick={props.functionHandleModalOpen}
          />

          <ButtonTCF
            variant={"green"}
            label={"Nova Transação"}
            disabled={false}
            size={"sm"}
            onClick={() => props.functionHandleModal("add", true)}
          />
        </Col>
        <Col xs={12} sm={12} md={12} lg={12} className="mb-3">
          <DatatableTCF
            columns={props.columns}
            rows={props.transactions}
            paginationModel={props.paginationModel}
            loading={props.loading}
          />
        </Col>
      </Row>
      <ModalTCF
        isOpen={props.isModalOpen}
        body={
          <TransacaoForm
            isEdit={props.typeTransaction === "edit"}
            isView={props.typeTransaction === "view"}
            formValues={props.dataToForm}
            showDatePicker={true}
            onSubmitAction={props.functionSubmit}
          />
        }
        title={props.modalTitle}
        hasFooter={false}
        center={true}
        sizeModal="md"
        type={"transacao"}
        onCloseAction={() => props.functionHandleModal("", false)}
      />
    </>
  );
}
